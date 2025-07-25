interface CloudflareEnv {
  // TODO Remove them from here because we are not longer loading them from the Cloudflare Context
  RESEND_API_KEY?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  BREVO_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_FROM_NAME?: string;
  EMAIL_REPLY_TO?: string;
  NSFW_CHECK_URL?: string;
  NSFW_CHECK_KEY?: string;
  PUNISHMENT_CREDIT_LOSS?: string;
  UPLOAD_BAN_HOURS?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  IMAGE_CAPTION_URL?: string;
  IMAGE_CAPTION_KEY?: string;
}
