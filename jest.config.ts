import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  preset: "ts-jest",
  testMatch: ["**/?(*.)+(test).[tj]s"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default config;

