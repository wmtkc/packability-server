/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

function makeModuleNameMapper(srcPath, tsconfigPath) {
  // Get paths from tsconfig
  const {paths} = require(tsconfigPath).compilerOptions;

  const aliases = {};

  // Iterate over paths and convert them into moduleNameMapper format
  Object.keys(paths).forEach((item) => {
      const key = item.replace('/*', '/(.*)');
      const path = paths[item][0].replace('/*', '/$1');
      aliases[key] = srcPath + '/' + path;
  });
  return aliases;
}

const TS_CONFIG_PATH = './tsconfig.json';
const SRC_PATH = '<rootDir>';

module.exports = {
  "preset": "ts-jest",
    "testEnvironment": "node",
    // "transform": {
    //   "node_modules/variables/.+\\.(j|t)sx?$": "ts-jest"
    // },
    "transformIgnorePatterns": [
      "node_modules/(?!variables/.*)"
    ],
    'roots': [
      '<rootDir>/src'
    ],
    'transform': {
        '^.+\\.tsx?$': 'ts-jest'
    },
    'moduleNameMapper': makeModuleNameMapper(SRC_PATH, TS_CONFIG_PATH)
};