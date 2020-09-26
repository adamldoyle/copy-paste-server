/* istanbul ignore file */
const path = require('path');
const createJestConfig = require('serverless-bundle/scripts/config/createJestConfig');
const relativePath = (relativePath) =>
  path.resolve(__dirname, 'node_modules/serverless-bundle', relativePath);
module.exports = createJestConfig(relativePath, __dirname);
