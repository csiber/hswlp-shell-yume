import { sqliteTable, integer, text, index, real } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { type InferSelectModel } from "drizzle-orm";

import { createId } from '@paralleldrive/cuid2'

// Az adatbázis teljes sémáját ebben a fájlban definiáljuk Drizzle ORM segítségével

export const ROLES_ENUM = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

const roleTuple = Object.values(ROLES_ENUM) as [string, ...string[]];

const commonColumns = {
  createdAt: integer({
    mode: "timestamp",
  }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer({
    mode: "timestamp",
  }).$onUpdateFn(() => new Date()).notNull(),
  updateCounter: integer().default(0).$onUpdate(() => sql`updateCounter + 1`),
}

// Felhasználói tábla a rendszerhez
// @ts-expect-error self-reference in column definitions
export const userTable = sqliteTable("user", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `usr_${createId()}`).notNull(),
  firstName: text({
    length: 255,
  }),
  lastName: text({
    length: 255,
  }),
  nickname: text({
    length: 255,
  }).notNull().unique(),
  nicknameUpdatedAt: integer("nickname_updated_at", {
    mode: "timestamp",
  }),
  email: text({
    length: 255,
  }).unique(),
  passwordHash: text(),
  role: text({
    enum: roleTuple,
  }).default(ROLES_ENUM.USER).notNull(),
  emailVerified: integer({
    mode: "timestamp",
  }),
  lastLoginAt: integer("last_login_at", {
    mode: "timestamp",
  }),
  signUpIpAddress: text({
    length: 100,
  }),
  googleAccountId: text({
    length: 255,
  }),
  // @ts-expect-error circular reference
  referredBy: text('referred_by').references(() => userTable.id),
  /**
   * This can either be an absolute or relative path to an image
   */
  avatar: text({
    length: 600,
  }),
  // Credit system fields
  currentCredits: integer().default(0).notNull(),
  lastCreditRefreshAt: integer({
    mode: "timestamp",
  }),
  // Marketplace feature flags
profileFrameEnabled: integer("profile_frame_enabled").default(0),
customAvatarUnlocked: integer("custom_avatar_unlocked").default(0),
selectedAvatarStyle: text("selected_avatar_style"),
pinnedPostId: text("pinned_post_id"),
emojiReactionsEnabled: integer("emoji_reactions_enabled").default(0).notNull(),
points: integer("points").default(0),
bonusFrame: integer("bonus_frame").default(0),
badgeUnlocked: integer("badge_unlocked").default(0),
uploadBanUntil: integer("upload_ban_until", { mode: "timestamp" }),

  uploadBanReason: text(),
  uploadLimitMb: integer().default(100),
  usedStorageMb: integer().default(0),
}, (table) => ([
  index('email_idx').on(table.email),
  index('nickname_idx').on(table.nickname),
  index('google_account_id_idx').on(table.googleAccountId),
  index('role_idx').on(table.role),
]));

export const passKeyCredentialTable = sqliteTable("passkey_credential", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `pkey_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  credentialId: text({
    length: 255,
  }).notNull().unique(),
  credentialPublicKey: text({
    length: 255,
  }).notNull(),
  counter: integer().notNull(),
  // Optional array of AuthenticatorTransport as JSON string
  transports: text({
    length: 255,
  }),
  // Authenticator Attestation GUID. We use this to identify the device/authenticator app that created the passkey
  aaguid: text({
    length: 255,
  }),
  // The user agent of the device that created the passkey
  userAgent: text({
    length: 255,
  }),
  // The IP address that created the passkey
  ipAddress: text({
    length: 100,
  }),
}, (table) => ([
  index('user_id_idx').on(table.userId),
  index('credential_id_idx').on(table.credentialId),
]));

// Credit transaction types
export const CREDIT_TRANSACTION_TYPE = {
  PURCHASE: 'PURCHASE',
  USAGE: 'USAGE',
  MONTHLY_REFRESH: 'MONTHLY_REFRESH',
  UPLOAD_REWARD: 'UPLOAD_REWARD',
  SIGN_UP_BONUS: 'SIGN_UP_BONUS',
} as const;

export const creditTransactionTypeTuple = Object.values(CREDIT_TRANSACTION_TYPE) as [string, ...string[]];

// Kredits tranzakciók naplózása
export const creditTransactionTable = sqliteTable("credit_transaction", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `ctxn_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  amount: integer().notNull(),
  // Track how many credits are still available from this transaction
  remainingAmount: integer().default(0).notNull(),
  type: text({
    enum: creditTransactionTypeTuple,
  }).notNull(),
  description: text({
    length: 255,
  }).notNull(),
  expirationDate: integer({
    mode: "timestamp",
  }),
  expirationDateProcessedAt: integer({
    mode: "timestamp",
  }),
  paymentIntentId: text({
    length: 255,
  }),
}, (table) => ([
  index('credit_transaction_user_id_idx').on(table.userId),
  index('credit_transaction_type_idx').on(table.type),
  index('credit_transaction_created_at_idx').on(table.createdAt),
  index('credit_transaction_expiration_date_idx').on(table.expirationDate),
  index('credit_transaction_payment_intent_id_idx').on(table.paymentIntentId),
]));

// Define item types that can be purchased
export const PURCHASABLE_ITEM_TYPE = {
  COMPONENT: 'COMPONENT',
  // Add more types in the future (e.g., TEMPLATE, PLUGIN, etc.)
} as const;

export const purchasableItemTypeTuple = Object.values(PURCHASABLE_ITEM_TYPE) as [string, ...string[]];

export const purchasedItemsTable = sqliteTable("purchased_item", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `pitem_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  // The type of item (e.g., COMPONENT, TEMPLATE, etc.)
  itemType: text({
    enum: purchasableItemTypeTuple,
  }).notNull(),
  // The ID of the item within its type (e.g., componentId)
  itemId: text().notNull(),
  purchasedAt: integer({
    mode: "timestamp",
  }).$defaultFn(() => new Date()).notNull(),
}, (table) => ([
  index('purchased_item_user_id_idx').on(table.userId),
  index('purchased_item_type_idx').on(table.itemType),
  // Composite index for checking if a user owns a specific item of a specific type
  index('purchased_item_user_item_idx').on(table.userId, table.itemType, table.itemId),
]));

export const uploadRewardTable = sqliteTable("upload_rewards", {
  id: text().primaryKey().$defaultFn(() => `urw_${createId()}`).notNull(),
  uploadId: text().notNull(),
  uploaderId: text().notNull(),
  viewerId: text().notNull(),
  event: text({ length: 20 }).notNull(),
  pointsAwarded: real().notNull(),
  createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => [
  index('upload_rewards_upload_viewer_event_idx').on(table.uploadId, table.viewerId, table.event),
]);


export const postsTable = sqliteTable("posts", {
  id: text().primaryKey().$defaultFn(() => `post_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  content: text().notNull(),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const referralEventsTable = sqliteTable("referral_events", {
  id: text().primaryKey().$defaultFn(() => `refe_${createId()}`).notNull(),
  referrerId: text('referrer_id').notNull().references(() => userTable.id),
  referredUserId: text('referred_user_id').notNull().references(() => userTable.id),
  timestamp: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  rewarded: integer().default(0).notNull(),
}, (table) => [
  index('referral_events_referrer_idx').on(table.referrerId),
  index('referral_events_referred_idx').on(table.referredUserId),
]);
export const highlightedPostsTable = sqliteTable("highlighted_posts", {
  id: text().primaryKey().$defaultFn(() => `hlp_${createId()}`).notNull(),
  post_id: text().notNull().references(() => postsTable.id),
  user_id: text().notNull().references(() => userTable.id),
  expires_at: integer({ mode: "timestamp" }).notNull(),
});


export const marketplaceActivationsTable = sqliteTable("marketplace_activations", {
  id: text("id").primaryKey(),
  user_id: text("user_id"),
  component_id: text("component_id"),
  metadata: text("metadata"),
  activated_at: text("activated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Slow request log table for monitoring performance
export const slowRequestLogTable = sqliteTable("slow_request_logs", {
  id: text().primaryKey().$defaultFn(() => `slog_${createId()}`).notNull(),
  url: text().notNull(),
  durationMs: integer("duration_ms").notNull(),
  userId: text("user_id"),
  sessionHash: text("session_hash"),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
}, (table) => [
  index('slow_request_logs_user_id_idx').on(table.userId),
  index('slow_request_logs_created_at_idx').on(table.createdAt),
]);

// Badge table linking users to earned badges
export const userBadgeTable = sqliteTable('user_badges', {
  id: text().primaryKey().$defaultFn(() => `ubg_${createId()}`).notNull(),
  userId: text('user_id').notNull().references(() => userTable.id),
  badgeKey: text('badge_key').notNull(),
  awardedAt: integer('awarded_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => [
  index('user_badges_user_id_idx').on(table.userId),
  index('user_badges_badge_key_idx').on(table.badgeKey),
]);

export const creditWarningEmailTable = sqliteTable('credit_warning_email', {
  id: text().primaryKey().$defaultFn(() => `cwl_${createId()}`).notNull(),
  userId: text('user_id').notNull().references(() => userTable.id),
  sentAt: integer('sent_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => [
  index('credit_warning_email_user_idx').on(table.userId),
]);

export const firstPostEmailTable = sqliteTable('first_post_email', {
  id: text().primaryKey().$defaultFn(() => `fpe_${createId()}`).notNull(),
  userId: text('user_id').notNull().references(() => userTable.id),
  postId: text('post_id').notNull(),
  sendAfter: integer('send_after', { mode: 'timestamp' }).notNull(),
  sentAt: integer('sent_at', { mode: 'timestamp' }),
}, (table) => [
  index('first_post_email_user_idx').on(table.userId),
  index('first_post_email_send_after_idx').on(table.sendAfter),
]);



// System-defined roles - these are always available
export const SYSTEM_ROLES_ENUM = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

export const systemRoleTuple = Object.values(SYSTEM_ROLES_ENUM) as [string, ...string[]];

// Define available permissions
export const TEAM_PERMISSIONS = {
  // Resource access
  ACCESS_DASHBOARD: 'access_dashboard',
  ACCESS_BILLING: 'access_billing',

  // User management
  INVITE_MEMBERS: 'invite_members',
  REMOVE_MEMBERS: 'remove_members',
  CHANGE_MEMBER_ROLES: 'change_member_roles',

  // Team management
  EDIT_TEAM_SETTINGS: 'edit_team_settings',
  DELETE_TEAM: 'delete_team',

  // Role management
  CREATE_ROLES: 'create_roles',
  EDIT_ROLES: 'edit_roles',
  DELETE_ROLES: 'delete_roles',
  ASSIGN_ROLES: 'assign_roles',

  // Content permissions
  CREATE_COMPONENTS: 'create_components',
  EDIT_COMPONENTS: 'edit_components',
  DELETE_COMPONENTS: 'delete_components',

  // Add more as needed
} as const;

// Team table
export const teamTable = sqliteTable("team", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `team_${createId()}`).notNull(),
  name: text({ length: 255 }).notNull(),
  slug: text({ length: 255 }).notNull().unique(),
  description: text({ length: 1000 }),
  avatarUrl: text({ length: 600 }),
  // Settings could be stored as JSON
  settings: text({ length: 10000 }),
  // Optional billing-related fields
  billingEmail: text({ length: 255 }),
  planId: text({ length: 100 }),
  planExpiresAt: integer({ mode: "timestamp" }),
  creditBalance: integer().default(0).notNull(),
}, (table) => ([
  index('team_slug_idx').on(table.slug),
]));

// Team membership table
export const teamMembershipTable = sqliteTable("team_membership", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `tmem_${createId()}`).notNull(),
  teamId: text().notNull().references(() => teamTable.id),
  userId: text().notNull().references(() => userTable.id),
  // This can be either a system role or a custom role ID
  roleId: text().notNull(),
  // Flag to indicate if this is a system role
  isSystemRole: integer().default(1).notNull(),
  invitedBy: text().references(() => userTable.id),
  invitedAt: integer({ mode: "timestamp" }),
  joinedAt: integer({ mode: "timestamp" }),
  expiresAt: integer({ mode: "timestamp" }),
  isActive: integer().default(1).notNull(),
}, (table) => ([
  index('team_membership_team_id_idx').on(table.teamId),
  index('team_membership_user_id_idx').on(table.userId),
  // Instead of unique() which causes linter errors, we'll create a unique constraint on columns
  index('team_membership_unique_idx').on(table.teamId, table.userId),
]));

// Team role table
export const teamRoleTable = sqliteTable("team_role", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `trole_${createId()}`).notNull(),
  teamId: text().notNull().references(() => teamTable.id),
  name: text({ length: 255 }).notNull(),
  description: text({ length: 1000 }),
  // Store permissions as a JSON array of permission keys
  permissions: text({ mode: 'json' }).notNull().$type<string[]>(),
  // A JSON field for storing UI-specific settings like color, icon, etc.
  metadata: text({ length: 5000 }),
  // Optional flag to mark some roles as non-editable
  isEditable: integer().default(1).notNull(),
}, (table) => ([
  index('team_role_team_id_idx').on(table.teamId),
  // Instead of unique() which causes linter errors, we'll create a unique constraint on columns
  index('team_role_name_unique_idx').on(table.teamId, table.name),
]));

// Team invitation table
export const teamInvitationTable = sqliteTable("team_invitation", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `tinv_${createId()}`).notNull(),
  teamId: text().notNull().references(() => teamTable.id),
  email: text({ length: 255 }).notNull(),
  // This can be either a system role or a custom role ID
  roleId: text().notNull(),
  // Flag to indicate if this is a system role
  isSystemRole: integer().default(1).notNull(),
  token: text({ length: 255 }).notNull().unique(),
  invitedBy: text().notNull().references(() => userTable.id),
  expiresAt: integer({ mode: "timestamp" }).notNull(),
  acceptedAt: integer({ mode: "timestamp" }),
  acceptedBy: text().references(() => userTable.id),
}, (table) => ([
  index('team_invitation_team_id_idx').on(table.teamId),
  index('team_invitation_email_idx').on(table.email),
  index('team_invitation_token_idx').on(table.token),
]));

export const teamRelations = relations(teamTable, ({ many }) => ({
  memberships: many(teamMembershipTable),
  invitations: many(teamInvitationTable),
  roles: many(teamRoleTable),
}));

export const teamRoleRelations = relations(teamRoleTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamRoleTable.teamId],
    references: [teamTable.id],
  }),
}));

export const teamMembershipRelations = relations(teamMembershipTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamMembershipTable.teamId],
    references: [teamTable.id],
  }),
  user: one(userTable, {
    fields: [teamMembershipTable.userId],
    references: [userTable.id],
  }),
  invitedByUser: one(userTable, {
    fields: [teamMembershipTable.invitedBy],
    references: [userTable.id],
  }),
}));

export const teamInvitationRelations = relations(teamInvitationTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamInvitationTable.teamId],
    references: [teamTable.id],
  }),
  invitedByUser: one(userTable, {
    fields: [teamInvitationTable.invitedBy],
    references: [userTable.id],
  }),
  acceptedByUser: one(userTable, {
    fields: [teamInvitationTable.acceptedBy],
    references: [userTable.id],
  }),
}));


export const userRelations = relations(userTable, ({ many }) => ({
  passkeys: many(passKeyCredentialTable),
  creditTransactions: many(creditTransactionTable),
  purchasedItems: many(purchasedItemsTable),
  badges: many(userBadgeTable),
  teamMemberships: many(teamMembershipTable),
  referrals: many(referralEventsTable, {
    relationName: 'referrer',
  }),
  referredByEvents: many(referralEventsTable, {
    relationName: 'referred',
  }),
}));

export type User = InferSelectModel<typeof userTable>;
export type PassKeyCredential = InferSelectModel<typeof passKeyCredentialTable>;
export type CreditTransaction = InferSelectModel<typeof creditTransactionTable>;
export type PurchasedItem = InferSelectModel<typeof purchasedItemsTable>;
export type Team = InferSelectModel<typeof teamTable>;
export type TeamMembership = InferSelectModel<typeof teamMembershipTable>;
export type TeamRole = InferSelectModel<typeof teamRoleTable>;
export type TeamInvitation = InferSelectModel<typeof teamInvitationTable>;
export type UploadReward = InferSelectModel<typeof uploadRewardTable>;
export type Post = InferSelectModel<typeof postsTable>;
export type HighlightedPost = InferSelectModel<typeof highlightedPostsTable>;
export type MarketplaceActivation = InferSelectModel<typeof marketplaceActivationsTable>;
export type SlowRequestLog = InferSelectModel<typeof slowRequestLogTable>;
export type ReferralEvent = InferSelectModel<typeof referralEventsTable>;
export type UserBadge = InferSelectModel<typeof userBadgeTable>;
export type CreditWarningEmail = InferSelectModel<typeof creditWarningEmailTable>;
export type FirstPostEmail = InferSelectModel<typeof firstPostEmailTable>;
