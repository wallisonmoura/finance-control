// Runs before `npm run start` (prestart).
//
// `next start` runs in production mode, and in that mode Next loads the
// .env.production* files from the project folder. A local file like that can
// point at the production database: a local server would then read and write
// real data. This check stops a local `npm run start` unless the database is
// local, or the remote one is released on purpose with ALLOW_REMOTE_DB=1.
//
// Vercel does not run `npm run start`, so production is not affected.
import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;

// Same files and order as `next start` (dev = false). Variables already set
// in the shell win over the files, as in Next.
loadEnvConfig(process.cwd(), false, { info: () => {}, error: console.error });

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || process.env.ALLOW_REMOTE_DB === '1') {
  process.exit(0);
}

let host;

try {
  host = new URL(databaseUrl).hostname;
} catch {
  console.error('DATABASE_URL não é uma URL válida; o servidor não foi iniciado.');
  process.exit(1);
}

if (!LOCAL_HOSTS.has(host)) {
  console.error(
    [
      `O banco em DATABASE_URL não é local (${host}); o servidor não foi iniciado.`,
      'O `next start` carrega os arquivos .env.production*, que podem apontar para a produção.',
      'Para usar o banco local: set -a; source .env; set +a; npm run start',
      'Para usar esse banco de propósito: ALLOW_REMOTE_DB=1 npm run start',
    ].join('\n'),
  );
  process.exit(1);
}
