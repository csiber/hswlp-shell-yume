"use server";

import { createServerAction, ZSAError } from "zsa"
import { getDB } from "@/db"
import { userTable, CREDIT_TRANSACTION_TYPE } from "@/db/schema"
import { SIGN_UP_BONUS_CREDITS } from "@/constants"
import { signUpSchema } from "@/schemas/signup.schema";
import { createId } from "@paralleldrive/cuid2";
import { hashPassword } from "@/utils/password-hasher";
import { createSession, generateSessionToken, setSessionTokenCookie } from "@/utils/auth";
import { logTransaction } from "@/utils/credits";
import { eq } from "drizzle-orm";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";
import { getIP } from "@/utils/get-IP";
import { validateTurnstileToken } from "@/utils/validate-captcha";
import { isTurnstileEnabled } from "@/flags";

export const signUpAction = createServerAction()
  .input(signUpSchema)
  .handler(async ({ input }) => {
    return withRateLimit(
      async () => {
        const db = getDB();

        if (await isTurnstileEnabled() && input.captchaToken) {
          const success = await validateTurnstileToken(input.captchaToken)

          if (!success) {
            throw new ZSAError(
              "INPUT_PARSE_ERROR",
              "Kérjük, töltsd ki a captchát"
            )
          }
        }

        // Check if email is already taken
        const existingUser = await db.query.userTable.findFirst({
          where: eq(userTable.email, input.email),
        });

        if (existingUser) {
          throw new ZSAError(
            "CONFLICT",
            "Ez az email cím már foglalt"
          );
        }

        // Hash the password
        const hashedPassword = await hashPassword({ password: input.password });

        // Create the user with signup credits
        const nickname = `anon_${createId().slice(0, 8)}`;

        const [user] = await db.insert(userTable)
          .values({
            nickname,
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            passwordHash: hashedPassword,
            signUpIpAddress: await getIP(),
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

        if (!user || !user.email) {
          throw new ZSAError(
            "INTERNAL_SERVER_ERROR",
            "Nem sikerült létrehozni a felhasználót"
          );
        }

        try {
          // Create a session
          const sessionToken = generateSessionToken();
          const session = await createSession({
            token: sessionToken,
            userId: user.id,
            authenticationType: "password",
          });

          // Set the session cookie
          await setSessionTokenCookie({
            token: sessionToken,
            userId: user.id,
            expiresAt: new Date(session.expiresAt)
          });

          // no email verification in this lightweight build
        } catch (error) {
          console.error(error)

          throw new ZSAError(
            "INTERNAL_SERVER_ERROR",
            "Nem sikerült létrehozni a munkamenetet a regisztráció után"
          );
        }

        return { success: true };
      },
      RATE_LIMITS.SIGN_UP
    );
  })
