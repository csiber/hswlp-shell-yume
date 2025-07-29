import type { Route } from "next"

export const SITE_NAME = "🧩 HSWLP Yumekai"
export const SITE_DESCRIPTION =
  "The future of creativity starts here. Explore the boundaries of art and share your creations with a supportive community. Join us and be part of the creative revolution!"
export const SITE_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://yumekai.app"
export const GITHUB_REPO_URL = "https://github.com/csiber/hswlp-next"

export const SITE_DOMAIN = new URL(SITE_URL).hostname
export const PASSWORD_RESET_TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60 // 24 hours
export const EMAIL_VERIFICATION_TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60 // 24 hours
export const MAX_SESSIONS_PER_USER = 5;
export const MAX_TEAMS_CREATED_PER_USER = 3;
export const MAX_TEAMS_JOINED_PER_USER = 10;
export const SESSION_COOKIE_NAME = "session";

export const CREDIT_PACKAGES = [
  { id: "yume-package-1", credits: 500, price: 5 },
  { id: "yume-package-2", credits: 1200, price: 10 },
  { id: "yume-package-3", credits: 3000, price: 20 },
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
    description: 'Welcome! You just started your Yumekai journey.',
    icon: '🔰',
  },
  hot_dropper: {
    name: '🔥 Hot Dropper',
    description: '3 trending posts within 7 days',
    icon: '🔥',
  },
  fan_favorite: {
    name: '🫶 Fan Favorite',
    description: 'One of your posts received 20+ likes',
    icon: '🫶',
  },
  visual_artist: {
    name: '🌸 Visual Artist',
    description: '100 uploaded posts',
    icon: '🌸',
  },
  master_commentator: {
    name: '💬 Master Commentator',
    description: 'Your comments reached a total of 100 likes',
    icon: '💬',
  },
  spender: {
    name: '🪙 Spender',
    description: 'You have spent 1000 points in total',
    icon: '🪙',
  },
} as const

export type BadgeKey = keyof typeof BADGE_DEFINITIONS

// Simple profanity filter list for comments
export const BANNED_WORDS = ['fuck', 'shit', 'bitch'] as const
