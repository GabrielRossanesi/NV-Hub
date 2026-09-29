import { PrismaClient } from '@prisma/client';
import { isDeepStrictEqual } from 'node:util';

const projectRef = 'jtbithltxaqfnhjadsjt';
const tables = [
  ['user', 'user'],
  ['session', 'session'],
  ['account', 'account'],
  ['verification', 'verification'],
  ['organization', 'organization'],
  ['member', 'member'],
  ['invitation', 'invitation'],
  ['organization_feature', 'organizationFeature'],
  ['audit_log', 'auditLog'],
  ['client', 'client'],
  ['task', 'task'],
  ['task_note', 'taskNote'],
  ['publication', 'publication'],
];

function isExpectedSupabaseDestination(connectionString) {
  try {
    const url = new URL(connectionString);
    const username = decodeURIComponent(url.username);
    return url.hostname === `db.${projectRef}.supabase.co` ||
      (url.hostname.endsWith('.pooler.supabase.com') && username.endsWith(`.${projectRef}`));
  } catch {
    return false;
  }
}

async function countRows(connectionString) {
  const prisma = new PrismaClient({ datasources: { db: { url: connectionString } } });
  try {
    const result = {};
    for (const [table, model] of tables) {
      result[table] = await prisma[model].count();
    }
    return result;
  } finally {
    await prisma.$disconnect();
  }
}

async function compareContents(sourceUrl, destinationUrl) {
  const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
  const destination = new PrismaClient({ datasources: { db: { url: destinationUrl } } });
  try {
    const mismatches = [];
    for (const [table, model] of tables) {
      const [sourceRows, destinationRows] = await Promise.all([
        source[model].findMany({ orderBy: { id: 'asc' } }),
        destination[model].findMany({ orderBy: { id: 'asc' } }),
      ]);
      if (!isDeepStrictEqual(sourceRows, destinationRows)) mismatches.push(table);
    }
    return mismatches;
  } finally {
    await Promise.all([source.$disconnect(), destination.$disconnect()]);
  }
}

async function main() {
  const sourceUrl = process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL;
  const destinationUrl = process.env.SUPABASE_DIRECT_URL;
  if (!sourceUrl) throw new Error('SOURCE_DATABASE_URL ou DATABASE_URL ausente.');

  const source = await countRows(sourceUrl);
  if (!destinationUrl) {
    console.log(JSON.stringify({ event: 'nvhub.db-row-counts', source }));
    return;
  }
  if (!isExpectedSupabaseDestination(destinationUrl)) {
    throw new Error(`SUPABASE_DIRECT_URL não identifica o projeto ${projectRef}.`);
  }

  const destination = await countRows(destinationUrl);
  const mismatches = tables
    .map(([table]) => table)
    .filter((table) => source[table] !== destination[table]);
  const contentMismatches = process.argv.includes('--content')
    ? await compareContents(sourceUrl, destinationUrl)
    : undefined;
  console.log(JSON.stringify({ event: 'nvhub.db-row-counts', source, destination, mismatches, contentMismatches }));
  if (mismatches.length > 0 || contentMismatches?.length > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(`Falha na contagem de registros (${error?.code || 'sem código'}). Verifique as conexões e o schema.`);
  process.exitCode = 1;
});
