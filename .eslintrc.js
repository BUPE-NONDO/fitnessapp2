/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@fitness-app/eslint-config/base"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
