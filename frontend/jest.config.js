/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', {
            presets: [
                ['@babel/preset-env', {
                    targets: { node: 'current' },
                    modules: 'auto'
                }],
                ['@babel/preset-react', {
                    runtime: 'automatic',
                    importSource: '@testing-library/react'
                }],
                ['@babel/preset-typescript', {
                    isTSX: true,
                    allExtensions: true
                }]
            ],
            plugins: [
                '@babel/plugin-transform-runtime',
                'babel-plugin-transform-import-meta'
            ]
        }],
        '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js'
    },
    setupFilesAfterEnv: [
        '@testing-library/jest-dom/extend-expect',
        '<rootDir>/src/setupTests.ts'
    ],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/config/jest/fileMock.js'
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