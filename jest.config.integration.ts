/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "src/(.*)": "<rootDir>/src/$1",
    "tests/(.*)": "<rootDir>/__tests__/$1",
  },
  collectCoverageFrom: ["src/**/*.ts"],
  setupFilesAfterEnv: ["./jest.setup.ts"],
};
