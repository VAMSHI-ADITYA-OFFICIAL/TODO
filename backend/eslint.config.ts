import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    ignores: ["dist/**", "node_modules/**"], // <-- ignore here
    plugins: { js },
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },

  // Spread TS configs but add ignores manually
  ...tseslint.configs.recommended.map((cfg) => ({
    ...cfg,
    ignores: ["dist/**", "node_modules/**"],
  })),

  {
    files: ["**/*.{ts,mts,cts}"],
    ignores: ["dist/**", "node_modules/**"], // <-- again here
    rules: {
      "no-console": ["error", { allow: ["warn", "error", "info"] }],
    },
  },
]);
