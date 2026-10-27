import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-plugin-react can't auto-detect the React version under ESLint 10.
  { settings: { react: { version: "19.3" } } },
  // Illustrations are static SVGs and the site is a static export (images.unoptimized),
  // so plain <img> is the right element here; next/image would add nothing.
  { rules: { "@next/next/no-img-element": "off" } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "demo/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
