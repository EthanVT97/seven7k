module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
    testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json'
        }
    }
}; 