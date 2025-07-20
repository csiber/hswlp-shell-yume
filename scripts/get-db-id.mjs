import { parseWranglerConfig } from './utils/parse-wrangler.mjs';

try {
  const config = parseWranglerConfig();
  const dbEntry = config.d1_databases?.find((db) => db.binding === 'DB')
    ?? config.d1_databases?.[0];
  const dbId = dbEntry?.database_id;

  if (!dbId) {
    console.error('Database ID not found in wrangler.jsonc');
    process.exit(1);
  }

  console.log(dbId);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
