import { z } from "zod";
import { catchaSchema } from "./catcha.schema";

export const passkeyEmailSchema = z.object({
  nickname: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  email: z.string().email("Kérjük, érvényes e-mail címet adj meg"),
  firstName: z
    .string()
    .min(2, "A keresztnévnek legalább 2 karakter hosszúnak kell lennie")
    .max(255),
  lastName: z
    .string()
    .min(2, "A vezetéknévnek legalább 2 karakter hosszúnak kell lennie")
    .max(255),
  captchaToken: catchaSchema,
});

export type PasskeyEmailSchema = z.infer<typeof passkeyEmailSchema>;
