# راهنمای عامل و مهندسی

این فایل قرارداد کار روی فرانت کارویتا است. `CLAUDE.md` به همین‌جا ارجاع می‌دهد.

## قبل از تغییر

1. [`README.md`](./README.md) — راه افتادن
2. [`docs/data-flow.md`](./docs/data-flow.md) — Facade، HTTP، توکن
3. [`docs/contributing.md`](./docs/contributing.md) — چک‌لیست فیچر جدید
4. [`docs/decisions.md`](./docs/decisions.md) — چرا این معماری

## تغییرناپذیرها (خلاصه)

- UI فقط Facade صدا می‌زند؛ HTTP فقط `api-client.ts`.
- مسیر فقط `RouteService`.
- mock در production ممنوع است.
- `src/proxy.ts` را به `middleware.ts` تبدیل نکنید.
- `retry.limit` در ky را از `1` کم نکنید.
- اسکلتون UI نسازید.
- دامنهٔ خالی (stub) نسازید.
- کامنت فارسی است؛ شناسه و مسیر HTTP انگلیسی. فقط «چرا»، نه بازگویی کد.

## تست بعد از تغییر رفتار

`pnpm typecheck` و `pnpm test` حداقل روی فایل‌های مربوط. اگر UI داشبورد عوض شد و مرورگر در دسترس است، جریان را دست بزنید نه فقط اسکرین‌شات.
