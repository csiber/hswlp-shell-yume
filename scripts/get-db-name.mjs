import { parseWranglerConfig } from './utils/parse-wrangler.mjs';

try {
  const config = parseWranglerConfig();
  const dbEntry = config.d1_databases?.find((db) => db.binding === 'DB')
    ?? config.d1_databases?.[0];
  const dbName = dbEntry?.database_name;

  if (!dbName) {
    console.error('Database name not found in wrangler.jsonc');
    process.exit(1);
  }

  console.log(dbName);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
