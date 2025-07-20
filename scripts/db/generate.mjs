import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const blockedTables = [
  'credit_transaction',
  'passkey_credential',
  'purchased_item',
  'revalidations',
  'tags',
  'team',
  'team_invitation',
  'team_membership',
  'team_role',
  'user',
];

const migrationName = process.argv[2];
if (!migrationName) {
  console.error('Missing migration name. Usage: pnpm db:generate <name>');
  process.exit(1);
}

const migrationsDir = path.resolve('src/db/migrations');
const metaDir = path.join(migrationsDir, 'meta');

const beforeFiles = new Set(fs.readdirSync(migrationsDir));
const beforeMeta = new Set(fs.readdirSync(metaDir));

try {
  execSync(`pnpm exec drizzle-kit generate --name ${migrationName}`, {
    stdio: 'inherit',
  });
} catch (err) {
  process.exit(err.status || 1);
}

const afterFiles = new Set(fs.readdirSync(migrationsDir));
const afterMeta = new Set(fs.readdirSync(metaDir));

const newSqlFiles = [...afterFiles].filter(f => !beforeFiles.has(f) && f.endsWith('.sql'));
const newMetaFiles = [...afterMeta].filter(f => !beforeMeta.has(f));

let blockedTable = null;
for (const file of newSqlFiles) {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  blockedTable = blockedTables.find((table) => new RegExp(`\\b${table}\\b`, 'i').test(content));
  if (blockedTable) break;
}

if (blockedTable) {
  for (const file of newSqlFiles) {
    fs.rmSync(path.join(migrationsDir, file));
  }
  for (const file of newMetaFiles) {
    fs.rmSync(path.join(metaDir, file));
  }
  console.error(`\u26A0\uFE0F A(z) ${blockedTable} tábla a közös \`hswlp-d1\` adatbázis része, nem módosítható ebből a projektből. Kérlek, helyezd át a \`global migrations\` könyvtárba (pl. \`migrations/global\`).`);
  process.exit(1);
}
