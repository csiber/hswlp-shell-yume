import { z } from "zod";
import { catchaSchema } from "./catcha.schema";

export const passkeyEmailSchema = z.object({
  nickname: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  // User must provide a valid email address
  email: z.string().email("Please enter a valid email address"),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters long")
    .max(255),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters long")
    .max(255),
  captchaToken: catchaSchema,
  referrerId: z.string().optional(),
});

export type PasskeyEmailSchema = z.infer<typeof passkeyEmailSchema>;
