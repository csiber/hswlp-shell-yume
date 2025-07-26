import { z } from "zod";
import { catchaSchema } from "./catcha.schema";

export const forgotPasswordSchema = z.object({
  // Prompt user for a valid email address
  email: z.string().email("Please enter a valid email address"),
  captchaToken: catchaSchema,
});
