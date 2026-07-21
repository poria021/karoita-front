import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * Product UI must not hardcode colors in TS/TSX.
 * Define HSL tokens as `--kv-*` in `src/app/globals.css`, then use `*-kv-*` utilities.
 * Exception: third-party brand SVGs (see ignores).
 */
const COLOR_LITERAL_MESSAGE =
  'Hardcoded colors (#hex / rgb() / hsl()) are forbidden in TS/TSX. Add HSL `--kv-*` tokens in globals.css and use bg-kv-*/text-kv-*/border-kv-*/fill-kv-* utilities. See .cursor/rules/70-color-hsl-tokens.mdc.';

const UI_PRODUCT_BYPASS_MESSAGE =
  'Product composition belongs in shared: use KvTable stack, shared/skeleton wrappers, domain *Field / FieldFrame, EmptyState, ConfirmationDialog, and shell — not raw ui/table or ui/skeleton from features/app. Plain atoms (Button, Badge, Spinner, Checkbox, Tooltip, …) MAY come from @/components/ui/*. See docs/design-system.md.';

/**
 * Next 16 ships flat configs — do not use FlatCompat for `next/*` extends
 * (breaks with circular JSON when validating plugins).
 */
const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'dist/**'],
  },
  ...nextVitals,
  ...nextTs,
  {
    // Prefer typed DTOs; allow outside product cores during migration.
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-explicit-any': 'off',
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/services/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'Literal[value=/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$/]',
          message: COLOR_LITERAL_MESSAGE,
        },
        {
          selector: 'Literal[value=/^rgba?\\(|^hsla?\\(/i]',
          message: COLOR_LITERAL_MESSAGE,
        },
        {
          // Catches hex embedded in longer strings, e.g. fill="#104ec6" class pieces
          selector:
            'Literal[value=/#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\\b/]',
          message: COLOR_LITERAL_MESSAGE,
        },
        {
          selector: 'Literal[value=/\\b(?:rgb|rgba|hsl|hsla)\\s*\\(/i]',
          message: COLOR_LITERAL_MESSAGE,
        },
      ],
    },
  },
  /**
   * Layer law: features/app MAY import plain ui atoms.
   * Forbidden: bypass product stacks (admin table, cold skeletons) via raw ui.
   */
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components/ui/table', '@/components/ui/table/*'],
              message: UI_PRODUCT_BYPASS_MESSAGE,
            },
            {
              group: ['@/components/ui/skeleton', '@/components/ui/skeleton/*'],
              message: UI_PRODUCT_BYPASS_MESSAGE,
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
