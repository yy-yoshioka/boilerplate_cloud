const config = {
  displayName: 'web',
  testMatch: ['<rootDir>/app/web/__tests__/**/*.test.ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/web/$1',
    '^@packages/(.*)$': '<rootDir>/packages/$1',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testEnvironment: 'jsdom',
};

export default config;
