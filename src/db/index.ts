import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { wrapD1 } from "@/utils/with-timeout";

import * as schema from "./schema";

// Simple helper to access the D1 database from the Workers environment

export let db: DrizzleD1Database<typeof schema> | null = null;

export const getDB = async () => {
  if (db) {
    return db;
  }

  const { env } = await getCloudflareContext({ async: true });

  // Throw an error if the D1 database is not configured
  if (!env.NEXT_TAG_CACHE_D1) {
    throw new Error("D1 database not found");
  }

  // Create the Drizzle ORM connection to the D1 database
  db = drizzle(wrapD1(env.NEXT_TAG_CACHE_D1), { schema, logger: true });

  return db;
};
