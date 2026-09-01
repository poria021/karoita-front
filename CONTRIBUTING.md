# کار روی این مخزن

مخاطب: مهندسی که فرانت کارویتا را برای اولین بار باز می‌کند. این فایل قرارداد تیم است، نه ابزار.

قبل از اولین تغییر، به این ترتیب بخوانید:

1. [`README.md`](./README.md) — نصب و اسکریپت‌ها
2. [`docs/data-flow.md`](./docs/data-flow.md) — Facade، HTTP، توکن
3. [`docs/decisions.md`](./docs/decisions.md) — چرا این معماری
4. [`docs/contributing.md`](./docs/contributing.md) — چک‌لیست فیچر، import ممنوع، تست، UI
5. [`docs/architecture-folders.md`](./docs/architecture-folders.md) — درخت پوشه
6. [`docs/planned-domains.md`](./docs/planned-domains.md) — دامنه‌هایی که هنوز نباید stub شوند

## شروع

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

قفل مخزن pnpm است.

## قبل از PR

```bash
pnpm typecheck
pnpm lint
pnpm test
```

اگر رفتار UI داشبورد عوض شد، همان جریان را در مرورگر هم بزنید — فقط اسکرین‌شات کافی نیست.

## گیت و انتشار

دو برنچ پایدار:

| برنچ | نقش |
|------|------|
| `dev` | کار روزانه. فیچر و فیکس اینجا commit و push می‌شود. |
| `main` | نسخهٔ سرور. فقط از `dev` merge می‌شود. |

روی `main` مستقیم کار نکنید. سرور فقط `main` را بیلد می‌کند.

```bash
git checkout dev
# کار، بعد:
pnpm typecheck && pnpm lint && pnpm test
git add -p   # یا فایل‌های مربوط
git commit
git push origin dev
```

وقتی برای سرور آماده شد:

```bash
git checkout main
git pull origin main
git merge --no-ff dev
git push origin main
```

`.env` و `.env.local` را commit نکنید. روی سرور از [`.env.production.example`](./.env.production.example) کپی کنید؛ `NEXT_PUBLIC_*` باید **قبل از `pnpm build`** ست شود. `NEXT_PUBLIC_IS_DEV` فقط برای لوکال است — روی سرور نگذارید.

جزئیات اضافه کردن دامنه، الگوی Facade، و کامنت‌گذاری در [`docs/contributing.md`](./docs/contributing.md) است.
