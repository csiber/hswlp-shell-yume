import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "./schema";

// Egyszerű segédfüggvény a D1 adatbázis eléréséhez Workers környezetben

export let db: DrizzleD1Database<typeof schema> | null = null;
export let globalDb: DrizzleD1Database<typeof schema> | null = null;

export const getDB = async () => {
  if (db) {
    return db;
  }

  const { env } = await getCloudflareContext({ async: true });

  // Először a projekthez társított DB kötést próbáljuk használni,
  // majd ha az nem létezik, a global vagy a cache adatbázist.
  const database = env.DB ?? env.DB_GLOBAL ?? env.NEXT_TAG_CACHE_D1;

  // Ha a D1 adatbázis nincs beállítva, hibát dobunk
  if (!database) {
    throw new Error("D1 database not found");
  }

  // Létrehozzuk a Drizzle ORM kapcsolatot a D1 adatbázissal
  db = drizzle(database, { schema, logger: true });

  return db;
};

export const getGlobalDB = async () => {
  if (globalDb) {
    return globalDb;
  }

  const { env } = await getCloudflareContext({ async: true });

  const database = env.DB_GLOBAL ?? env.DB ?? env.NEXT_TAG_CACHE_D1;

  if (!database) {
    throw new Error("D1 database not found");
  }

  globalDb = drizzle(database, { schema, logger: true });

  return globalDb;
};
