/** @type {import('jest').Config} */
export default {
  testEnvironment: "jsdom",

  rootDir: process.cwd(),

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",

    // Shared alias (adjust if needed)
    "^@/(.*)$": "<rootDir>/src/$1",

    // Fix ESM relative imports
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },

  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": [
      "babel-jest",
      { configFile: "./babel.config.cjs" }
    ]
  },

  extensionsToTreatAsEsm: [".ts", ".tsx"],

  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/build/"
  ],

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  passWithNoTests: true
};
