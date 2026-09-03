# کارویتا — فرانت‌اند

فرانت Next.js (App Router) برای سامانهٔ آموزشی کارویتا. بک‌اند Nest جداست؛ در این مخزن دیتابیس و ORM نیست.

دو حالت API:

- **mock** — شبیه‌ساز داخل مرورگر (`localStorage` + OTP ثابت). فقط برای توسعهٔ محلی.
- **real** — مصرف API نست از طریق `NEXT_PUBLIC_API_URL`. در production مقدار `mock` عمداً خطا می‌دهد.

قفل وابستگی‌ها **pnpm** است (`pnpm-lock.yaml`). با `npm install` قفل را عوض نکنید.

## از کجا بخوانید

| فایل | برای چه |
|------|---------|
| [`docs/data-flow.md`](docs/data-flow.md) | جریان داده: Facade، HTTP، توکن، وضعیت وصل بودن Nest |
| [`docs/architecture-folders.md`](docs/architecture-folders.md) | درخت پوشه و مرز لایه‌ها |
| [`docs/decisions.md`](docs/decisions.md) | چرا این معماری |
| [`docs/contributing.md`](docs/contributing.md) | چک‌لیست فیچر جدید و importهای ممنوع |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | شروع کار و چک قبل از PR |

قانون‌های اصلی (جزئیات در `data-flow.md`):

1. UI و hook فقط **Facade** داخل `src/services/` را صدا می‌زنند — نه `fetch` / `ky` / `apiClient`.
2. HTTP فقط در `src/services/api-client.ts`.
3. لیست‌های صفحه‌بندی‌شده با **TanStack Query** (`useOffsetLimitInfiniteList`).
4. مسیر داخلی فقط از **`RouteService`**.
5. `NEXT_PUBLIC_API_MODE=mock|real` — شکل Facade یکی است.

## راه افتادن

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

در development اگر `NEXT_PUBLIC_API_MODE` خالی باشد، پیش‌فرض mock است.

## اسکریپت‌ها

| دستور | کار |
|--------|-----|
| `pnpm dev` | سرور توسعه |
| `pnpm build` / `pnpm start` | بیلد و اجرای پروداکشن |
| `pnpm typecheck` | TypeScript |
| `pnpm lint` | ESLint + رنگ هاردکد + مرز UI |
| `pnpm test` | Vitest |
| `pnpm test:e2e` | دود Playwright فقط در حالت mock |

E2E سرور را روی `127.0.0.1:3000` بالا می‌آورد. قبلش هر `next dev` دیگر این مخزن را ببندید — Next ۱۶ فقط یک اینستنس می‌پذیرد. ورود ادمین در تست از `/auth/admin-gate` است، نه `/auth/login`. جزئیات در [`docs/contributing.md`](docs/contributing.md).

## متغیرهای محیطی

نمونه در `.env.example`. مهم‌ها:

| متغیر | نکته |
|--------|------|
| `NEXT_PUBLIC_API_MODE` | `mock` یا `real`. خالی → در dev برابر mock، در production برابر real. `mock` صریح در production خطا می‌دهد. |
| `NEXT_PUBLIC_API_URL` | آدرس پایهٔ Nest بدون اسلش پایانی. برای real لازم است. |
| `NEXT_PUBLIC_SITE_URL` | آدرس عمومی سایت (SEO / لینک مطلق). |
| `NEXT_PUBLIC_S3_URL` | مبدأ عمومی باکت برای پیش‌نمایش مدرک هویت. |
| `NEXT_PUBLIC_AUTH_COOKIE_NAME` | اختیاری؛ پیش‌فرض `karvita_session`. |
| `BACKEND_INTERNAL_URL` | آدرس Nest سمت سرور (runtime). روی Darkube لازم است اگر بیلد بدون `NEXT_PUBLIC_API_URL` بوده. |

## روی سرور

متغیرهای `NEXT_PUBLIC_*` موقع **`pnpm build`** داخل باندل می‌شوند. بعد از بیلد عوض کردنشان در مرورگر اثر ندارد.

1. کلیدها در [`.env.production.example`](./.env.production.example) هستند. اگر Darkube فقط env زمان اجرا دارد، **`BACKEND_INTERNAL_URL`** را روی پاد بگذارید (همان آدرس Nest، مثلاً `https://backenddev.darkube.ir/api`). مرورگر از `/__nest-api` می‌زند و Node همان آدرس را پروکسی می‌کند.
2. اگر می‌توانید `--build-arg` بدهید، `NEXT_PUBLIC_API_URL` را هم همان‌جا ست کنید.
3. `NEXT_PUBLIC_API_MODE=real` — مقدار `mock` در production کرش می‌کند.
4. بیلد بدون داکر:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

`pnpm dev` برای سرور نیست.

صفحات **کارورزی، تأیید روزانه، ظرفیت‌ها، و CMS لندینگ حذف نشده‌اند.** تا وقتی endpoint نست برسد، همان Facade در حالت real پیام «هنوز به API واقعی متصل نشده» می‌دهد. mock محلی برای توسعهٔ همان صفحات سر جایش است. وضعیت وصل بودن در [`docs/data-flow.md`](docs/data-flow.md) است.
