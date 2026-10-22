import react from "@repo/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig(
  react,
  { languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } } },
  {
    // This package is "type": "commonjs", so plain .js config files use require().
    files: ["*.js"],
    languageOptions: { sourceType: "commonjs" },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
);
