// eslint-disable-next-line @typescript-eslint/no-require-imports
const { config } = require('dotenv');

config({
  path: '.env.test',
  override: true,
  quiet: true,
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL não definido para testes de integração. Configure .env.test antes de rodar test:integration.',
  );
}

const databaseName = new URL(databaseUrl).pathname.slice(1);
const isTestDatabase = /(^|[_-])test($|[_-])/.test(databaseName);

if (!isTestDatabase) {
  throw new Error(
    `Banco de integração inseguro: "${databaseName}". Use um banco separado com "test" no nome.`,
  );
}

// toErrorNextResponse's fallback logs unhandled errors before returning a
// generic 500 (see src/shared/presentation/http/to-error-next-response.ts).
// Tests that deliberately trigger that fallback (to assert the 500 itself)
// print this log even though they pass — filter only that exact message,
// leaving any other console.error (real bugs, etc.) visible.
// This file runs as a Jest `setupFiles` entry (once per test file, before
// the test framework installs beforeAll/afterAll), so the override is
// applied directly at the top level rather than inside a lifecycle hook.
const originalConsoleError = console.error;

console.error = (...args) => {
  const [firstArg] = args;
  const isUnhandledRouteError =
    typeof firstArg === 'string' &&
    firstArg.startsWith('Unhandled error in route handler:');

  if (isUnhandledRouteError) {
    return;
  }

  originalConsoleError(...args);
};
