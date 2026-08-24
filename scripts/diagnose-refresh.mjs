#!/usr/bin/env node
/**
 * diagnose-refresh.mjs
 *
 * تشخیص اینکه کندی/timeout روی POST /v1/auth/refresh مربوط به کل سرور Nest
 * است یا فقط همین یک اندپوینت، پایدار است یا گاه‌به‌گاه (flaky).
 *
 * نسخه‌ی ۲: با توکن رفرش *واقعی* تست می‌کند (نه یک Bearer فیک) — چون
 * مسیر کد داخل Nest برای یک JWT از لحاظ ساختار نامعتبر ممکن است خیلی
 * سریع‌تر از مسیر کد برای یک refresh token واقعاً منقضی/نامعتبر باشد
 * (که احتمالاً یک lookup در دیتابیس برای چک‌کردن hash نشست دارد).
 *
 * ── گرفتن توکن واقعی ────────────────────────────────────────────────────
 *   1. مرورگر → F12 → تب Application (یا Storage) → Cookies →
 *      http://localhost:3000
 *   2. مقدار کوکی به نام `karvita_rt` (یا هرچه REAL_REFRESH_COOKIE_NAME در
 *      src/lib/real-auth-cookie.ts باشد) را کپی کن.
 *   3. آن را با --token=... بده یا در متغیر محیطی KARVITA_RT بگذار.
 *
 * ── اجرای یک‌باره (۱۰ درخواست پشت‌سرهم) ────────────────────────────────
 *   node scripts/diagnose-refresh.mjs --token=<refresh-token>
 *
 * ── حالت مانیتورینگ مداوم (هر N دقیقه، تا Ctrl+C) ──────────────────────
 *   node scripts/diagnose-refresh.mjs --token=<refresh-token> --watch --interval=2
 *
 * ── بدون توکن واقعی (fallback به قبلی، فقط تست ساختار/شبکه) ───────────
 *   node scripts/diagnose-refresh.mjs
 */

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    return [key, value ?? true];
  })
);

const BASE_URL = (
  args.base ??
  process.env.NEXT_PUBLIC_API_URL ??
  'https://backenddev.darkube.ir/api'
).replace(/\/$/, '');

const COUNT = Number(args.count ?? 10);
const TIMEOUT_MS = Number(args.timeout ?? 8000); // همان مقدار route.ts
const WATCH = Boolean(args.watch);
const INTERVAL_MIN = Number(args.interval ?? 2);

const REAL_TOKEN = args.token ?? process.env.KARVITA_RT ?? null;

if (!REAL_TOKEN) {
  console.log(
    '⚠️  توکن رفرش واقعی داده نشده — با یک Bearer فیک تست می‌شود (نتیجه کمتر دقیق است).'
  );
  console.log(
    '    برای نتیجه‌ی دقیق: --token=<مقدار کوکی karvita_rt از DevTools> یا env KARVITA_RT\n'
  );
}

const BEARER = REAL_TOKEN ?? 'diagnostic-fake-token';

const TARGETS = [
  {
    name: 'POST /v1/auth/refresh (مشکوک)',
    path: 'v1/auth/refresh',
    method: 'POST',
    headers: { Authorization: `Bearer ${BEARER}` },
  },
  {
    name: 'GET  /v1/auth/me   (مقایسه‌ای)',
    path: 'v1/auth/me',
    method: 'GET',
    // /me عمداً با توکن فیک می‌ماند — این یک اکسس‌توکن می‌خواهد، نه رفرش‌توکن؛
    // هدف فقط سنجش زمان پاسخ کلی سرور برای مقایسه است، نه اعتبارسنجی موفق.
    headers: { Authorization: 'Bearer diagnostic-fake-token' },
  },
];

function fmt(ms) {
  return `${ms.toFixed(0)}ms`;
}

function nowStamp() {
  return new Date().toLocaleString('fa-IR', { hour12: false });
}

async function timedRequest(url, method, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method,
      headers: { 'x-custom-lang': 'fa', ...headers },
      signal: controller.signal,
    });
    const elapsed = performance.now() - start;
    return { ok: true, status: res.status, elapsed, timedOut: false };
  } catch (err) {
    const elapsed = performance.now() - start;
    const timedOut = err?.name === 'AbortError';
    return { ok: false, status: null, elapsed, timedOut, error: err?.message };
  } finally {
    clearTimeout(timer);
  }
}

async function runTarget(target, count) {
  console.log(`\n=== ${target.name} ===`);
  console.log(`URL: ${BASE_URL}/${target.path}`);
  const results = [];

  for (let i = 1; i <= count; i++) {
    const result = await timedRequest(
      `${BASE_URL}/${target.path}`,
      target.method,
      target.headers
    );
    results.push(result);

    const label = result.timedOut
      ? `⏱️  TIMEOUT (>${TIMEOUT_MS}ms)`
      : result.ok
        ? `status ${result.status}`
        : `❌ ERROR: ${result.error}`;
    console.log(`  #${String(i).padStart(2, '0')}  ${fmt(result.elapsed).padStart(8)}  ${label}`);
  }

  return results;
}

function summarize(name, results) {
  const timings = results.map((r) => r.elapsed);
  const timeouts = results.filter((r) => r.timedOut).length;
  const errors = results.filter((r) => !r.ok && !r.timedOut).length;
  const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
  const min = Math.min(...timings);
  const max = Math.max(...timings);

  console.log(`\n--- خلاصه: ${name} ---`);
  console.log(`  تعداد درخواست: ${results.length}`);
  console.log(`  میانگین زمان پاسخ: ${fmt(avg)}`);
  console.log(`  کمینه/بیشینه: ${fmt(min)} / ${fmt(max)}`);
  console.log(`  تعداد timeout (>${TIMEOUT_MS}ms): ${timeouts}`);
  console.log(`  تعداد خطای شبکه دیگر: ${errors}`);

  return { timeouts, errors, avg, min, max };
}

async function runOnce() {
  const allResults = [];
  for (const target of TARGETS) {
    const results = await runTarget(target, COUNT);
    allResults.push({ name: target.name, results });
  }

  console.log(`\n############  نتیجه‌ی این دور  ############`);
  const summaries = allResults.map(({ name, results }) => ({
    name,
    ...summarize(name, results),
  }));

  const refreshSummary = summaries[0];
  const meSummary = summaries[1];

  console.log(`\n--- تفسیر ---`);
  if (refreshSummary.timeouts > 0 && meSummary.timeouts === 0) {
    console.log(
      '⚠️  فقط /v1/auth/refresh تایم‌اوت می‌شود، /v1/auth/me سالم است.'
    );
    console.log(
      '    → مشکل احتمالاً در منطق داخلی همین اندپوینت رفرش سمت Nest است.'
    );
  } else if (refreshSummary.timeouts > 0 && meSummary.timeouts > 0) {
    console.log('⚠️  هر دو مسیر تایم‌اوت می‌شوند → مشکل کلی سرور/شبکه است.');
  } else if (refreshSummary.max > TIMEOUT_MS * 0.5) {
    console.log(
      `⚠️  تایم‌اوت نشد، اما بیشینه‌ی زمان پاسخ (${fmt(refreshSummary.max)}) به سقف ${TIMEOUT_MS}ms نزدیک است.`
    );
    console.log('    → یک بار کندی اضافه (شبکه/سرور) کافی است تا رد شود.');
  } else {
    console.log('✅ در این دور هیچ تایم‌اوت یا کندی نگران‌کننده‌ای دیده نشد.');
  }

  return { refreshSummary, meSummary };
}

async function main() {
  console.log(`تشخیص کندی/Timeout روی بک‌اند`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`تعداد تکرار هر مسیر: ${COUNT}  |  حد Timeout: ${TIMEOUT_MS}ms`);
  console.log(`توکن رفرش: ${REAL_TOKEN ? 'واقعی (از --token/KARVITA_RT)' : 'فیک (fallback)'}`);

  if (!WATCH) {
    await runOnce();
    return;
  }

  console.log(
    `\n🔁 حالت مانیتورینگ مداوم فعال — هر ${INTERVAL_MIN} دقیقه یک دور، تا Ctrl+C.\n`
  );

  const log = [];
  let round = 0;
  while (true) {
    round += 1;
    console.log(`\n\n========== دور ${round} — ${nowStamp()} ==========`);
    const { refreshSummary } = await runOnce();
    log.push({ round, time: nowStamp(), ...refreshSummary });

    console.log(`\n📋 تاریخچه‌ی /refresh تا این لحظه:`);
    for (const entry of log) {
      console.log(
        `  دور ${entry.round} (${entry.time}): میانگین ${fmt(entry.avg)}, بیشینه ${fmt(entry.max)}, timeout=${entry.timeouts}`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MIN * 60_000));
  }
}

main().catch((err) => {
  console.error('اجرای اسکریپت با خطا مواجه شد:', err);
  process.exit(1);
});
