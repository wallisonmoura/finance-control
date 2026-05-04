import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const backendJestConfig = {
  displayName: 'backend',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/tests/unit/modules/**/*.spec.ts',
    '<rootDir>/tests/integration/**/*.spec.ts',
    '<rootDir>/tests/unit/shared/**/*.spec.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/unit/shared/presentation/ui/',
    '<rootDir>/tests/unit/modules/.*/presentation/ui/',
  ],
};

export default createJestConfig(backendJestConfig);
