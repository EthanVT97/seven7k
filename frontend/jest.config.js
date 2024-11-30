/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    setupFilesAfterEnv: [
        '<rootDir>/src/setupTests.ts'
    ],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
    },
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.tsx',
        '!src/serviceWorker.ts',
        '!src/setupTests.ts',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!src/**/*.types.{js,jsx,ts,tsx}',
        '!src/mocks/**',
        '!src/**/index.{js,jsx,ts,tsx}'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/.next/',
        '/build/',
        '/coverage/'
    ],
    transformIgnorePatterns: [
        '/node_modules/(?!(@babel/runtime|@babel/runtime-corejs3|@testing-library)/).+\\.js$',
        '^.+\\.module\\.(css|sass|scss)$'
    ],
    globals: {
        'ts-jest': {
            isolatedModules: true,
            tsconfig: '<rootDir>/tsconfig.json'
        }
    },
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname'
    ],
    verbose: true,
    testTimeout: 10000,
    clearMocks: true,
    resetMocks: false,
    restoreMocks: true,
    errorOnDeprecated: true,
    testEnvironmentOptions: {
        url: 'http://localhost'
    }
}

module.exports = config; 