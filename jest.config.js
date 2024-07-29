/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  transform: { "^.+\\.ts$": ["ts-jest", {}] },
  testEnvironment: "node",
  coverageReporters: ["text", "html", "json"],
  coverageDirectory: "<rootDir>/coverage",
  reporters: ["default"],
  modulePathIgnorePatterns: ["<rootDir>/lib"],
};
