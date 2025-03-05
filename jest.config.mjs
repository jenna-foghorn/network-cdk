import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  prettierConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-prototype-builtins": "off",
    },
  },
  {
    ignores: ["cdk.out/**", "**/*.d.ts", "**/*.js"],
  },
];

