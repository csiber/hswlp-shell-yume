import type { Route } from "next"

export const SITE_NAME = "Yumekai"
export const SITE_DESCRIPTION =
  "A kreativitás jövője itt kezdődik. Fedezd fel a művészet határait, és oszd meg alkotásaidat egy támogató közösséggel. Csatlakozz hozzánk, és légy része a kreatív forradalomnak!"
export const SITE_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://hswlp-shell-yumekai.promnet.workers.dev/"
export const GITHUB_REPO_URL = "https://github.com/csiber/hswlp-next"

export const SITE_DOMAIN = new URL(SITE_URL).hostname
export const PASSWORD_RESET_TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60 // 24 hours
export const EMAIL_VERIFICATION_TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60 // 24 hours
export const MAX_SESSIONS_PER_USER = 5;
export const MAX_TEAMS_CREATED_PER_USER = 3;
export const MAX_TEAMS_JOINED_PER_USER = 10;
export const SESSION_COOKIE_NAME = "session";

export const CREDIT_PACKAGES = [
  { id: "yume-package-1", credits: 500, price: 500 },
  { id: "yume-package-2", credits: 1200, price: 1000 },
  { id: "yume-package-3", credits: 3000, price: 2000 },
] as const;

export const CREDITS_EXPIRATION_YEARS = 2;

export const FREE_MONTHLY_CREDITS = CREDIT_PACKAGES[0].credits * 0.1;
export const SIGN_UP_BONUS_CREDITS = 50;
export const MAX_TRANSACTIONS_PER_PAGE = 10;
export const REDIRECT_AFTER_SIGN_IN = "/dashboard" as Route;

export const ALBUM_PRICING_MODE =
  (process.env.ALBUM_PRICING_MODE as 'grouped' | 'per-item') || 'grouped'
export const ALBUM_GROUP_CREDITS = 3
export const MAX_ALBUM_UPLOAD = 10

export const PUNISHMENT_CREDIT_LOSS = parseInt(process.env.PUNISHMENT_CREDIT_LOSS || '20', 10)
export const UPLOAD_BAN_HOURS = parseInt(process.env.UPLOAD_BAN_HOURS || '24', 10)

// Badge definitions for the achievement system
export const BADGE_DEFINITIONS = {
  newcomer: {
    name: '🔰 Newcomer',
    description: 'Üdvözlünk! Most kezdted Yumekai kalandodat.',
    icon: '🔰',
  },
  hot_dropper: {
    name: '🔥 Hot Dropper',
    description: '3 trending poszt egy héten belül',
    icon: '🔥',
  },
  fan_favorite: {
    name: '🫶 Fan Favorite',
    description: 'Egy poszt 20+ like-ot kapott',
    icon: '🫶',
  },
  visual_artist: {
    name: '🌸 Visual Artist',
    description: '100 feltöltött poszt',
    icon: '🌸',
  },
  master_commentator: {
    name: '💬 Master Commentator',
    description: 'Kommentjeid összesen elértek 100 like-ot',
    icon: '💬',
  },
  spender: {
    name: '🪙 Spender',
    description: '1000 pontot elköltöttél valaha',
    icon: '🪙',
  },
} as const

export type BadgeKey = keyof typeof BADGE_DEFINITIONS
