# کار روی این مخزن

مخاطب: مهندسی که برای اولین بار این فرانت را باز می‌کند. فهرست خواندن روزِ اول در [`CONTRIBUTING.md`](../CONTRIBUTING.md) است. قبل از کد، [`data-flow.md`](./data-flow.md) و [`decisions.md`](./decisions.md) را بخوانید.

## شروع

```bash
pnpm install          # این مخزن با pnpm قفل شده است
cp .env.example .env.local
pnpm dev
```

حالت پیش‌فرض در development برابر `mock` است مگر `NEXT_PUBLIC_API_MODE=real` بگذارید.

چک‌های اجباری قبل از PR:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

`pnpm lint` علاوه بر ESLint، رنگ هاردکد و import مستقیم از `@/components/ui` در فیچرها را رد می‌کند.

## اضافه کردن یک قابلیت دامنه (checklist)

همهٔ این‌ها را در **یک** تغییر بیاورید. دامنهٔ خالی (stub پوشه بدون صفحه) ممنوع است — نگاه کنید به [`planned-domains.md`](./planned-domains.md).

1. **`src/types/{دامنه}.ts`** — DTO شکل فرانت. ارقام شناسه/موبایل ASCII انگلیسی. برچسب UI فارسی است.
2. **`src/services/{دامنه}.service.ts`** — تنها ورودی UI. شاخهٔ `IS_MOCK_MODE` به `mock/` یا `real/`.
3. **`src/services/{دامنه}/`** — mapper و HTTP همان دامنه؛ به دامنهٔ دیگر import نکنید مگر Facade عمومی.
4. **`src/features/karvita/{دامنه}/`** — `components/`، در صورت نیاز `hooks/` و `schemas/` (Zod). پوشهٔ خالی `schemas/` نسازید.
5. **`src/app/(app)/.../page.tsx`** — فقط routing، metadata، گارد سبک، و delegate به ماژول فیچر. جدول و فرم اینجا نیست.
6. **`RouteService`** — مسیر جدید. اگر لینک سایدبار است، به `LIVE_STATIC_NAV_PATHS` هم اضافه کنید.
7. اگر دامنهٔ سطح‌بالای جدیدی غیر از `karvita` / `shared` ساختید، `FEATURE_DOMAINS` در `eslint.config.mjs` را هم‌زمان به‌روز کنید.

### importهای ممنوع

| از | به | وضعیت |
|----|----|--------|
| `features/A` | `features/B` | ممنوع |
| `features/*` | `apiClient` / `ky` / `fetch` | ممنوع |
| `features/*` | `@/components/ui/*` | ممنوع — از `components/shared` ترکیب کنید |
| هر جا | رشتهٔ مسیر دامنه | ممنوع — `RouteService` |
| صفحهٔ `app/` | Facade دامنه برای جدول/فرم | ممنوع — از فیچر بگذرد |

استثناء: `features/shared` برای auth، پروفایل، مارکتینگ است؛ باز هم فیچر کارورزی نباید فیچر ساختار سازمانی را import کند. دادهٔ مشترک از Facade یا `src/types` یا `src/components/shared` می‌آید.

## الگوی Facade

```ts
export const ExampleService = {
  async list() {
    if (isMockApiMode()) return mockList();
    return realList(); // داخل real فقط apiClient
  },
};
```

اگر Nest هنوز route ندارد، **fail-closed** کنید: `throwRealModeNotImplemented('ExampleService.list')`. UI خالیِ دروغین در production نشان ندهید مگر degrad کردن صریح و مستند باشد (مثل context انتخاب واحد در سرفصل).

Mapper را در `real/` نگه دارید. نام فیلد Nest (`fname`, `phone`, `title`) را به شکل فرانت (`firstName`, `mobile`, `name`) تبدیل کنید.

## کامنت و مستند داخل کد

زبان تیم فارسی است؛ شناسه‌ها، env، مسیر HTTP و نام نوع انگلیسی می‌مانند.

- بالای فایل غیربدیهی: این فایل چیست، نفر بعدی چه کار نباید بکند، چرا تصمیم غیرواضح گرفته شده.
- روی export عمومی: هدف + محدودیت + نگاشت Nest اگر وجود دارد.
- داخل بدنه: فقط «چرا» وقتی کد خلاف انتظار است (quirk لایو Nest، تلهٔ ky، race توکن، …).
- روی کد بدیهی (`if (!user) return`) کامنت نگذارید.
- اتم‌های shadcn در `src/components/ui` را با نثر محصول پر نکنید.

## تست

- واحد: Vitest کنار فایل (`*.test.ts`). mapper و schema اولویت دارند.
- E2E: Playwright فقط حالت mock (`pnpm test:e2e`). اول هر `next dev` دیگر را ببندید؛ Next ۱۶ یک اینستنس بیشتر راه نمی‌دهد.
- ورود ادمین در E2E از `/auth/admin-gate` است.

## UI

- محصول فارسی و RTL است. پیام خطای کاربر فارسی است؛ log توسعه‌دهنده می‌تواند انگلیسی باشد.
- لودینگ: chrome ثابت + اسپینر / `aria-busy` روی ناحیهٔ داده. اسکلتون استخوانی ممنوع است (`docs/architecture-folders.md`).
- رنگ فقط از توکن‌های `kv-*`. رنگ hex در JSX را lint رد می‌کند.
