/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/app/**/*.test.ts'],
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.devcontainer/',
    '<rootDir>/ci/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}
