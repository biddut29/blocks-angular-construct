// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const eslintConfigPrettier = require("eslint-config-prettier");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/out-tsc/**",
      "**/coverage/**",
      "react_Constract/**",
    ],
  },
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/template/prefer-control-flow": "off",
      "@angular-eslint/template/click-events-have-key-events": "off",
      "@angular-eslint/template/interactive-supports-focus": "off",
      "@angular-eslint/template/label-has-associated-control": "off",
      "@angular-eslint/template/no-autofocus": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/array-type": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-empty": "warn",
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [angular.configs.templateRecommended],
    rules: {
      "@angular-eslint/template/prefer-control-flow": "off",
      "@angular-eslint/template/click-events-have-key-events": "off",
      "@angular-eslint/template/interactive-supports-focus": "off",
      "@angular-eslint/template/label-has-associated-control": "off",
      "@angular-eslint/template/no-autofocus": "off",
    },
  },
  {
    files: ["src/app/components/ui-kit/**/*.ts"],
    rules: {
      "@angular-eslint/component-selector": "off",
      "@angular-eslint/directive-selector": "off",
      "@angular-eslint/no-input-rename": "off",
    },
  },
  eslintConfigPrettier,
]);
