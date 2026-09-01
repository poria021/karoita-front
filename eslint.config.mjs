import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * UI محصول نباید رنگ را در TS/TSX هاردکد کند.
 * توکن HSL را به‌صورت `--kv-*` در `src/app/globals.css` تعریف کنید و از utilityهای `*-kv-*` استفاده کنید.
 * استثناء: SVG برند third-party (نگاه کنید به ignores).
 */
const COLOR_LITERAL_MESSAGE =
  'Hardcoded colors (#hex / rgb() / hsl()) are forbidden in TS/TSX. Add HSL `--kv-*` tokens in globals.css and use bg-kv-*/text-kv-*/border-kv-*/fill-kv-* utilities.';

const UI_PRODUCT_BYPASS_MESSAGE =
  'Product composition belongs in shared: use KvTable stack / KvBusySurface, domain *Field / FieldFrame, EmptyState, ConfirmationDialog, and shell — not raw ui/table. Do not reintroduce ui/skeleton (product loading uses Spinner + KvBusySurface). Plain atoms (Button, Badge, Spinner, Checkbox, Tooltip, …) MAY come from @/components/ui/*. See docs/design-system.md.';

const CROSS_FEATURE_MESSAGE =
  'Cross-feature imports are forbidden. Move shared logic to src/services/ or src/components/shared/, or use shared types in src/types/. Do not import another features/[domain] slice.';

const HARDCODED_PATH_MESSAGE =
  'Hardcoded /karvita/ or /auth/ paths are forbidden in features/components. Use RouteService (or isAuthPath / isAdminControlPlanePath helpers) from @/services/route.service.';

const SKELETON_BAN_MESSAGE =
  'Skeleton bones are banned. Use Spinner / KvTableBusy / KvBusySurface / aria-busy — never @/components/ui/skeleton or shared/skeleton.';

const FA_SOLID_PACK_MESSAGE =
  'Named Font Awesome icons only via src/utils/iconMap.ts (faIcons). Do not import @fortawesome/free-solid-svg-icons outside that map.';

const FA_RESTRICTED_IMPORT_PATHS = [
  {
    name: '@fortawesome/free-solid-svg-icons',
    message: FA_SOLID_PACK_MESSAGE,
  },
];

const UI_RESTRICTED_IMPORT_PATTERNS = [
  {
    group: ['@/components/ui/table', '@/components/ui/table/*'],
    message: UI_PRODUCT_BYPASS_MESSAGE,
  },
  {
    group: ['@/components/ui/skeleton', '@/components/ui/skeleton/*'],
    message: SKELETON_BAN_MESSAGE,
  },
  {
    group: [
      '@/components/shared/skeleton',
      '@/components/shared/skeleton/**',
    ],
    message: SKELETON_BAN_MESSAGE,
  },
];

/** دامنه‌های `src/features/` — با افزودن اسلایس جدید هم‌زمان به‌روز کنید (`docs/planned-domains.md`). */
const FEATURE_DOMAINS = ['karvita', 'shared'];

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
    // hex داخل رشتهٔ طولانی‌تر، مثلاً `fill="#104ec6"` در تکه‌های class
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
    // template string که پیشوند مسیر دامنه دارد، مثلاً `/karvita/${role}/profile`
    selector: 'TemplateElement[value.raw=/\\/(?:karvita|auth)\\//]',
    message: HARDCODED_PATH_MESSAGE,
  },
];

/**
 * Next ۱۶ کانفیگ flat می‌دهد — برای `next/*` از FlatCompat استفاده نکنید
 * (با JSON حلقه‌ای موقع اعتبارسنجی plugin می‌شکند).
 */
const eslintConfig = [
  {
    // فایل‌های build و third-party که نباید lint شوند
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'public/**',
    ],
  },
  ...nextVitals,
  ...nextTs,
  {
    // DTO تایپ‌شده ترجیح است؛ بیرون هستهٔ محصول در مهاجرت warn می‌ماند.
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-explicit-any': 'off',
      /* a11y را از پیش‌فرض نکست سخت‌تر کن بدون اینکه فایل‌های نامرتبط را قفل کند. */
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',
      'jsx-a11y/iframe-has-title': 'error',
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
    ignores: ['src/lib/pwa/pwa-chrome-color.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...COLOR_RESTRICTED_SYNTAX],
    },
  },
  /**
   * قانون لایه: features/app می‌توانند اتم ui ساده را import کنند.
   * ممنوع: دور زدن استک محصول (جدول ادمین) با `ui/table` خام؛ `ui/skeleton` را برنگردانید.
   */
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: FA_RESTRICTED_IMPORT_PATHS,
          patterns: UI_RESTRICTED_IMPORT_PATTERNS,
        },
      ],
    },
  },
  /**
   * FSD چنددامنه‌ای: import از `features/[A]` به `features/[B]` ممنوع.
   * `app/**` می‌تواند features را import کند. بلوک‌های بعدی import را برای فایل‌های منطبق override می‌کنند.
   */
  ...FEATURE_DOMAINS.map((domain) => ({
    files: [`src/features/${domain}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: FA_RESTRICTED_IMPORT_PATHS,
          patterns: [
            ...UI_RESTRICTED_IMPORT_PATTERNS,
            ...otherFeatureImportPatterns(domain),
          ],
        },
      ],
    },
  })),
  {
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/services/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/store/**/*.{ts,tsx}',
      'src/utils/**/*.{ts,tsx}',
    ],
    ignores: ['src/utils/iconMap.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: FA_RESTRICTED_IMPORT_PATHS,
        },
      ],
    },
  },
  /**
   * قانون کاتالوگ مسیر: مسیر دامنه فقط از `RouteService` (هلپر C4 در services/lib مجاز).
   * تست / کاتالوگ مسیر / کانفیگ public-path در Edge نادیده گرفته می‌شوند.
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
