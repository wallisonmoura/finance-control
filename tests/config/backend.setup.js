// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ quiet: true });

// toErrorNextResponse's fallback logs unhandled errors before returning a
// generic 500 (see src/shared/presentation/http/to-error-next-response.ts).
// Tests that deliberately trigger that fallback (to assert the 500 itself)
// print this log even though they pass — filter only that exact message,
// leaving any other console.error (real bugs, React warnings, etc.) visible.
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
