import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Lint config for React + TypeScript apps.
 *
 * typescript-eslint does not support TypeScript 7, so linting runs on the
 * TypeScript 6 installed at the repo root while apps typecheck with their own.
 */
export default defineConfig(
  globalIgnores(["dist", "storybook-static"]),
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  reactHooks.configs.flat["recommended-latest"],
  jsxA11y.flatConfigs.recommended,
  storybook.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-refresh": reactRefresh },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { projectService: true },
    },
    rules: {
      "react-refresh/only-export-components": "error",
    },
  },
  {
    files: ["**/*.stories.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    // Config files sit outside the app's tsconfig, so lint them without type information.
    files: ["**/*.{js,mjs,cjs}", "*.{mts,cts}", ".storybook/**"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
