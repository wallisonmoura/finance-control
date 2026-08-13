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
