import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const transform = {
  '^.+\\.(js|jsx|ts|tsx)$': [
    'babel-jest',
    {
      presets: [['next/babel', { 'preset-react': { runtime: 'automatic' } }]],
    },
  ],
};

const config: Config = {
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      setupFiles: ['<rootDir>/tests/config/backend.setup.js'],
      transform,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testMatch: [
        '<rootDir>/tests/unit/*.spec.ts',
        '<rootDir>/tests/unit/modules/**/*.spec.ts',
        '<rootDir>/tests/unit/shared/**/*.spec.ts',
      ],
      testPathIgnorePatterns: [
        '<rootDir>/tests/unit/shared/presentation/ui/',
        '<rootDir>/tests/unit/modules/.*/presentation/ui/',
      ],
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      setupFiles: ['<rootDir>/tests/config/integration.setup.js'],
      transform,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testMatch: ['<rootDir>/tests/integration/**/*.spec.ts'],
    },
    {
      displayName: 'ui',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/config/ui.setup.js'],
      transform,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testMatch: [
        '<rootDir>/tests/unit/shared/presentation/ui/**/*.spec.ts',
        '<rootDir>/tests/unit/shared/presentation/ui/**/*.spec.tsx',
        '<rootDir>/tests/unit/modules/**/presentation/ui/**/*.spec.ts',
        '<rootDir>/tests/unit/modules/**/presentation/ui/**/*.spec.tsx',
      ],
    },
  ],
};

export default createJestConfig(config);
