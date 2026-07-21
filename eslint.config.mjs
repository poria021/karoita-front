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

const CROSS_FEATURE_MESSAGE =
  'Cross-feature imports are forbidden (rule 00/60). Move shared logic to src/services/ or src/components/shared/, or use shared types in src/types/. Do not import another features/[domain] slice.';

const HARDCODED_PATH_MESSAGE =
  'Hardcoded /karvita/ or /auth/ paths are forbidden in features/components (rule 20). Use RouteService (or isAuthPath / isAdminControlPlanePath helpers) from @/services/route.service.';

const UI_RESTRICTED_IMPORT_PATTERNS = [
  {
    group: ['@/components/ui/table', '@/components/ui/table/*'],
    message: UI_PRODUCT_BYPASS_MESSAGE,
  },
  {
    group: ['@/components/ui/skeleton', '@/components/ui/skeleton/*'],
    message: UI_PRODUCT_BYPASS_MESSAGE,
  },
];

/** Domains under src/features/ — keep in sync when adding a new slice. */
const FEATURE_DOMAINS = ['karvita', 'shared', 'reporting', 'forms-wizard'];

function otherFeatureImportPatterns(selfDomain) {
  return FEATURE_DOMAINS.filter((domain) => domain !== selfDomain).flatMap(
    (domain) => [
      {
        group: [`@/features/${domain}`, `@/features/${domain}/**`],
        message: CROSS_FEATURE_MESSAGE,
      },
    ]
  );
}

const COLOR_RESTRICTED_SYNTAX = [
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
];

const HARDCODED_PATH_SYNTAX = [
  {
    selector: "Literal[value=/^\\/(?:karvita|auth)\\//]",
    message: HARDCODED_PATH_MESSAGE,
  },
  {
    // Template strings that embed domain path prefixes, e.g. `/karvita/${role}/profile`
    selector: 'TemplateElement[value.raw=/\\/(?:karvita|auth)\\//]',
    message: HARDCODED_PATH_MESSAGE,
  },
];

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
      'no-restricted-syntax': ['error', ...COLOR_RESTRICTED_SYNTAX],
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
          patterns: UI_RESTRICTED_IMPORT_PATTERNS,
        },
      ],
    },
  },
  /**
   * Multi-domain FSD: no features/[A] → features/[B] imports.
   * app/** may import features (OK). Later blocks override imports for matched files.
   */
  ...FEATURE_DOMAINS.map((domain) => ({
    files: [`src/features/${domain}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...UI_RESTRICTED_IMPORT_PATTERNS,
            ...otherFeatureImportPatterns(domain),
          ],
        },
      ],
    },
  })),
  /**
   * Route catalog law: domain paths only via RouteService (C4 helpers OK in services/lib).
   * Tests / route catalog / Edge public-path config are ignored.
   */
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    ignores: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/services/route.service.ts',
      'src/lib/live-nav-paths.ts',
      'src/lib/public-paths.ts',
      'src/lib/return-url.ts',
      'src/proxy.ts',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...COLOR_RESTRICTED_SYNTAX,
        ...HARDCODED_PATH_SYNTAX,
      ],
    },
  },
];

export default eslintConfig;
