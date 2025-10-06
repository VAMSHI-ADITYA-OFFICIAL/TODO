// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintCongif = [
  // Extend Next.js recommended rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Ignore test files and coverage folder completely
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "**/__tests__/**",
      "next-env.d.ts",
    ],
  },

  // Global rules for your source code
  {
    rules: {
      // Allow console.warn/error/info, but error on other console usage
      "no-console": ["error", { allow: ["warn", "error", "info"] }],

      // Turn off base no-unused-vars, use TS version instead
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "none", // <- ignore all function/catch arguments
          argsIgnorePattern: "^_", // ignore args starting with _
          varsIgnorePattern: "^_", // still allow _prefix vars to be ignored
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all", // Check all variables
          args: "none", // Ignore unused function arguments
          argsIgnorePattern: "^_", // Ignore args starting with _
          varsIgnorePattern: "^_", // Ignore variables starting with _
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];

export default eslintCongif;
