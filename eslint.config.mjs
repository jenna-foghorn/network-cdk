import eslint from "@eslint/js";
import parser from "@typescript-eslint/parser";
import plugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";

export default [
  eslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser,
    },
    plugins: {
      "@typescript-eslint": plugin,
    },
    rules: {
      ...plugin.configs.recommended.rules,
      ...plugin.configs.stylistic.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "no-prototype-builtins": "off",
    },
  },
  prettier,
  {
    ignores: ["cdk.out/**", "**/*.d.ts", "**/*.js"],
  },
];
