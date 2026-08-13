// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@testing-library/jest-dom');

// jsdom não implementa navegação real (ex.: clicar em um <a href> do
// next/link). Isso é uma limitação conhecida do jsdom, não um erro da
// aplicação — filtramos apenas essa mensagem específica, mantendo
// qualquer outro console.error (ex.: warnings do React) visível.
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = (...args) => {
    const [firstArg] = args;
    const isJsdomNavigationNotImplemented =
      firstArg?.type === 'not implemented' &&
      typeof firstArg.message === 'string' &&
      firstArg.message.startsWith('Not implemented: navigation');

    if (isJsdomNavigationNotImplemented) {
      return;
    }

    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
