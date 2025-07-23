import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Kérjük, érvényes e-mail címet adj meg"),
  password: z.string().min(8, "A jelszónak legalább 8 karakter hosszúnak kell lennie"),
});

export type SignInSchema = z.infer<typeof signInSchema>;
