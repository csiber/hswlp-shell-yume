"use server";

import { createServerAction, ZSAError } from "zsa";
import { z } from "zod";
import { generatePasskeyRegistrationOptions, verifyPasskeyRegistration } from "@/utils/webauthn";
import { createId } from "@paralleldrive/cuid2";
import { getDB } from "@/db";
import { userTable, CREDIT_TRANSACTION_TYPE } from "@/db/schema";
import { SIGN_UP_BONUS_CREDITS } from "@/constants";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { createSession, generateSessionToken, setSessionTokenCookie } from "@/utils/auth";
import type { RegistrationResponseJSON, PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";
import { getIP } from "@/utils/get-IP";
import { passkeyEmailSchema } from "@/schemas/passkey.schema";
import ms from "ms";
import { validateTurnstileToken } from "@/utils/validate-captcha";
import { isTurnstileEnabled } from "@/flags";
import { logTransaction } from "@/utils/credits";

const PASSKEY_CHALLENGE_COOKIE_NAME = "passkey_challenge";
const PASSKEY_USER_ID_COOKIE_NAME = "passkey_user_id";

export const startPasskeyRegistrationAction = createServerAction()
  .input(passkeyEmailSchema)
  .handler(async ({ input }) => {
    return withRateLimit(
      async () => {
        if (await isTurnstileEnabled() && input.captchaToken) {
          const success = await validateTurnstileToken(input.captchaToken)

          if (!success) {
            throw new ZSAError(
              "INPUT_PARSE_ERROR",
              "Kérjük, töltsd ki a captchát"
            )
          }
        }

        const db = getDB();

        const existingUser = await db.query.userTable.findFirst({
          where: eq(userTable.email, input.email),
        });

        if (existingUser) {
          throw new ZSAError(
            "CONFLICT",
            "Ezzel az email címmel már létezik fiók"
          );
        }

        const ipAddress = await getIP();

        const nickname = `anon_${createId().slice(0, 8)}`;

        const [user] = await db.insert(userTable)
          .values({
            nickname,
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            signUpIpAddress: ipAddress,
            emailVerified: new Date(),
            currentCredits: SIGN_UP_BONUS_CREDITS,
            lastCreditRefreshAt: new Date(),
          })
          .returning();

        if (user) {
          const expirationDate = new Date();
          expirationDate.setMonth(expirationDate.getMonth() + 1);
          await logTransaction({
            userId: user.id,
            amount: SIGN_UP_BONUS_CREDITS,
            description: 'Signup bonus',
            type: CREDIT_TRANSACTION_TYPE.SIGN_UP_BONUS,
            expirationDate,
          });
        }

        if (!user) {
          throw new ZSAError(
            "INTERNAL_SERVER_ERROR",
            "Nem sikerült létrehozni a felhasználót"
          );
        }

        // Generate passkey registration options
        const options = await generatePasskeyRegistrationOptions(user.id, input.email);

        const cookieStore = await cookies();

        // Store the challenge in a cookie for verification
        cookieStore.set(PASSKEY_CHALLENGE_COOKIE_NAME, options.challenge, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          path: "/",
          maxAge: Math.floor(ms("10 minutes") / 1000),
        });

        // Store the user ID in a cookie for verification
        cookieStore.set(PASSKEY_USER_ID_COOKIE_NAME, user.id, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          path: "/",
          maxAge: Math.floor(ms("10 minutes") / 1000),
        });

        // Convert options to the expected type
        const optionsJSON: PublicKeyCredentialCreationOptionsJSON = {
          rp: options.rp,
          user: options.user,
          challenge: options.challenge,
          pubKeyCredParams: options.pubKeyCredParams,
          timeout: options.timeout,
          excludeCredentials: options.excludeCredentials,
          authenticatorSelection: options.authenticatorSelection,
          attestation: options.attestation,
          extensions: options.extensions,
        };

        return { optionsJSON };
      },
      RATE_LIMITS.SIGN_UP
    );
  });

const completePasskeyRegistrationSchema = z.object({
  response: z.custom<RegistrationResponseJSON>((val): val is RegistrationResponseJSON => {
    return typeof val === "object" && val !== null && "id" in val && "rawId" in val;
  }, "Érvénytelen regisztrációs válasz"),
});

export const completePasskeyRegistrationAction = createServerAction()
  .input(completePasskeyRegistrationSchema)
  .handler(async ({ input }) => {
    const cookieStore = await cookies();
    const challenge = cookieStore.get(PASSKEY_CHALLENGE_COOKIE_NAME)?.value;
    const userId = cookieStore.get(PASSKEY_USER_ID_COOKIE_NAME)?.value;

    if (!challenge || !userId) {
      throw new ZSAError(
        "PRECONDITION_FAILED",
        "Érvénytelen regisztrációs munkamenet"
      );
    }

    try {
      // Verify the registration
      await verifyPasskeyRegistration({
        userId,
        response: input.response,
        challenge,
        userAgent: (await headers()).get("user-agent"),
        ipAddress: await getIP(),
      });

      // Get user details for email verification
      const db = getDB();
      const user = await db.query.userTable.findFirst({
        where: eq(userTable.id, userId),
      });

      if (!user || !user.email) {
        throw new ZSAError(
          "INTERNAL_SERVER_ERROR",
          "Felhasználó nem található"
        );
      }


      // email verification is disabled in this lightweight build

      // Create a session
      const sessionToken = generateSessionToken();
      const session = await createSession({
        token: sessionToken,
        userId,
        authenticationType: "passkey",
        passkeyCredentialId: input.response.id
      });

      // Set the session cookie
      await setSessionTokenCookie({
        token: sessionToken,
        userId,
        expiresAt: new Date(session.expiresAt)
      });

      // Clean up cookies
      cookieStore.delete(PASSKEY_CHALLENGE_COOKIE_NAME);
      cookieStore.delete(PASSKEY_USER_ID_COOKIE_NAME);

      return { success: true };
    } catch (error) {
      console.error("Nem sikerült regisztrálni a passkey-t:", error);
      throw new ZSAError(
        "PRECONDITION_FAILED",
        "Nem sikerült regisztrálni a passkey-t"
      );
    }
  });
