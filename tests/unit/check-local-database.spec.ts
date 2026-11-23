import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// `npm run start` runs this first (prestart). `next start` loads
// .env.production* files, which may point at the production database: the
// check refuses to start a local server on any database but a local one.
const SCRIPT = join(__dirname, '../../scripts/check-local-database.mjs');

function runCheck(env: Record<string, string>) {
  // An empty folder: no .env file there, only the variables given here.
  const cwd = mkdtempSync(join(tmpdir(), 'check-local-database-'));

  try {
    return spawnSync(process.execPath, [SCRIPT], {
      cwd,
      env: { PATH: process.env.PATH ?? '', ...env },
      encoding: 'utf8',
    });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

describe('check-local-database (prestart)', () => {
  it.each([
    'postgresql://postgres:postgres@localhost:5432/finance_control?schema=public',
    'postgresql://postgres:postgres@127.0.0.1:5432/finance_control',
  ])('should allow a local database (%s)', (url) => {
    expect(runCheck({ DATABASE_URL: url }).status).toBe(0);
  });

  it('should refuse a remote database and say why', () => {
    const result = runCheck({
      DATABASE_URL: 'postgresql://user:secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('não é local');
    // The host is shown, never the password.
    expect(result.stderr).toContain('aws-0-us-east-1.pooler.supabase.com');
    expect(result.stderr).not.toContain('secret');
  });

  it('should allow a remote database when explicitly released', () => {
    const result = runCheck({
      DATABASE_URL: 'postgresql://user:secret@db.example.com:5432/postgres',
      ALLOW_REMOTE_DB: '1',
    });

    expect(result.status).toBe(0);
  });

  it('should read the database from a .env.production.local file, like next start', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'check-local-database-'));

    try {
      writeFileSync(
        join(cwd, '.env.production.local'),
        'DATABASE_URL="postgresql://user:secret@db.example.com:5432/postgres"\n',
      );
      const result = spawnSync(process.execPath, [SCRIPT], {
        cwd,
        env: { PATH: process.env.PATH ?? '' },
        encoding: 'utf8',
      });

      expect(result.status).toBe(1);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
