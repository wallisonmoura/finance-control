import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const uiJestConfig = {
  displayName: 'ui',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.ui.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/tests/unit/shared/presentation/ui/**/*.spec.ts',
    '<rootDir>/tests/unit/shared/presentation/ui/**/*.spec.tsx',
    '<rootDir>/tests/unit/modules/**/presentation/ui/**/*.spec.ts',
    '<rootDir>/tests/unit/modules/**/presentation/ui/**/*.spec.tsx',
  ],
};

export default createJestConfig(uiJestConfig);
