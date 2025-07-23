import { z } from "zod";

const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

export const catchaSchema = turnstileEnabled
  ? z.string().min(1, 'Kérjük, töltsd ki a captchát')
  : z.string().optional()
