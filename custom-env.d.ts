interface CloudflareEnv {
  // TODO Remove them from here because we are not longer loading them from the Cloudflare Context
  RESEND_API_KEY?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  BREVO_API_KEY?: string;
  NSFW_CHECK_URL?: string;
  NSFW_CHECK_KEY?: string;
  PUNISHMENT_CREDIT_LOSS?: string;
  UPLOAD_BAN_HOURS?: string;
  JWT_SECRET?: string;
  DB_GLOBAL: D1Database;
}
