export const GLOBAL_TABLES = [
  "credit_transaction",
  "passkey_credential",
  "purchased_item",
  "revalidations",
  "tags",
  "team",
  "team_invitation",
  "team_membership",
  "team_role",
  "user",
] as const;

export function getDb(env: CloudflareEnv, table?: string): D1Database {
  // Allow explicit binding selection by name
  if (table === 'DB_GLOBAL') {
    return env.DB_GLOBAL;
  }
  if (table === 'DB') {
    return env.DB;
  }
  if (table && GLOBAL_TABLES.includes(table as (typeof GLOBAL_TABLES)[number])) {
    return env.DB_GLOBAL;
  }
  return env.DB;
}
