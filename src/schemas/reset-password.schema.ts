import { z } from "zod";

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, "A jelszónak legalább 8 karakter hosszúnak kell lennie"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "A jelszavak nem egyeznek",
  path: ["confirmPassword"],
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
