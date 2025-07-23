import { z } from "zod";
import { catchaSchema } from "./catcha.schema";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Kérjük, érvényes e-mail címet adj meg"),
  captchaToken: catchaSchema,
});
