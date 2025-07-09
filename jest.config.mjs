// jest.config.mjs
export default {
    transform: {
        '^.+\\.(t|j)sx?$': ['ts-jest', { useESM: true }],
    },
    projects: [
        {
            displayName: 'web',
            testMatch: [
                '<rootDir>/apps/web/**/__tests__/**/*.(test|spec).[jt]s?(x)',
                '<rootDir>/apps/web/**/?(*.)+(test|spec).[jt]s?(x)',
            ],
            moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/apps/web/$1',
                '^@packages/(.*)$': '<rootDir>/packages/$1',
            },
            setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
            testEnvironment: 'jsdom',
        },
        {
            displayName: 'api',
            testMatch: ['<rootDir>/apps/api/**/tests/**/*.(test|spec).[jt]s'],
            testEnvironment: 'node',
        },
    ],
}
