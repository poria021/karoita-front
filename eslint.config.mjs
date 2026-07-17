import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * Product UI must not hardcode colors in TS/TSX.
 * Define HSL tokens as `--kv-*` in `src/app/globals.css`, then use `*-kv-*` utilities.
 * Exception: third-party brand SVGs (see ignores).
 */
const COLOR_LITERAL_MESSAGE =
  "Hardcoded colors (#hex / rgb() / hsl()) are forbidden in TS/TSX. Add HSL `--kv-*` tokens in globals.css and use bg-kv-*/text-kv-*/border-kv-*/fill-kv-* utilities. See .cursor/rules/70-color-hsl-tokens.mdc.";

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-explicit-any": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      // Official Google palette — not Karvita product tokens.
      "**/components/ui/icons.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$/]",
          message: COLOR_LITERAL_MESSAGE,
        },
        {
          selector:
            "Literal[value=/^rgba?\\(|^hsla?\\(/i]",
          message: COLOR_LITERAL_MESSAGE,
        },
        {
          // Catches hex embedded in longer strings, e.g. fill="#104ec6" class pieces
          selector: "Literal[value=/#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\\b/]",
          message: COLOR_LITERAL_MESSAGE,
        },
        {
          selector: "Literal[value=/\\b(?:rgb|rgba|hsl|hsla)\\s*\\(/i]",
          message: COLOR_LITERAL_MESSAGE,
        },
      ],
    },
  },
];

export default eslintConfig;
