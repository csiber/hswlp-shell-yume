import { z } from "zod";

export const signInSchema = z.object({
  // Require a valid email address
  email: z.string().email("Please enter a valid email address"),
  // Require a password of at least 8 characters
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type SignInSchema = z.infer<typeof signInSchema>;
