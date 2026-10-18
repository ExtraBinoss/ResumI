import parser from "@typescript-eslint/parser";
import hooks from "eslint-plugin-react-hooks";

// Oxlint owns JS/TS correctness, suspicious code, JSX, accessibility and typed
// promise checks. Keep the official Hooks/Compiler analysis here: Oxlint's native
// Compiler port remains experimental. Avoid reporting the same rule twice.
export default [
  {
    ignores: [
      "**/build/**",
      "**/node_modules/**",
      "**/.react-router/**",
      "**/.wrangler/**",
      "**/worker-configuration.d.ts",
      "**/*.generated.*",
      "artifacts/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  { linterOptions: { reportUnusedDisableDirectives: "error" } },
  // Parser-level strict mode catches octal syntax too; retain the pre-migration
  // ESLint rule until Oxlint provides the same named rule.
  { rules: { "no-octal": "error" } },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parser },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}", "packages/cv/src/**/*.tsx"],
    plugins: { "react-hooks": hooks },
    rules: hooks.configs["recommended-latest"].rules,
  },
];
