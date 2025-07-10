"use server";

import { createServerAction, ZSAError } from "zsa";
import { getDB } from "@/db";
import { userTable } from "@/db/schema";
import { signInSchema } from "@/schemas/signin.schema";
import { verifyPassword } from "@/utils/password-hasher";
import { createAndStoreSession } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { RATE_LIMITS, withRateLimit } from "@/utils/with-rate-limit";

export const signInAction = createServerAction()
  .input(signInSchema)
  .handler(async ({ input }) => {
    return withRateLimit(
      async () => {
        const db = getDB();

        try {
          // Find user by email
          const user = await db.query.userTable.findFirst({
            where: eq(userTable.email, input.email),
          });

          if (!user) {
            throw new ZSAError(
              "NOT_AUTHORIZED",
              "Érvénytelen email vagy jelszó"
            );
          }

          // Check if user has only Google SSO
          if (!user.passwordHash && user.googleAccountId) {
            throw new ZSAError(
              "FORBIDDEN",
              "Kérjük, jelentkezz be a Google-fiókoddal."
            );
          }

          if (!user.passwordHash) {
            throw new ZSAError(
              "NOT_AUTHORIZED",
              "Érvénytelen email vagy jelszó"
            );
          }

          // Verify password
          const isValid = await verifyPassword({
            storedHash: user.passwordHash,
            passwordAttempt: input.password
          });

          if (!isValid) {
            throw new ZSAError(
              "NOT_AUTHORIZED",
              "Érvénytelen email vagy jelszó"
            );
          }

          // Create session
          await createAndStoreSession(user.id, "password")

          return { success: true };
        } catch (error) {
          console.error(error)

          if (error instanceof ZSAError) {
            throw error;
          }

          throw new ZSAError(
            "INTERNAL_SERVER_ERROR",
            "Váratlan hiba történt"
          );
        }
      },
      RATE_LIMITS.SIGN_IN
    );
  });

