# جریان داده

نقشهٔ روزِ اول برای کسی که می‌خواهد روی کارویتا کار کند. جزئیات پوشه‌ها در [`architecture-folders.md`](./architecture-folders.md) است؛ «چرا این‌طور ساختیم» در [`decisions.md`](./decisions.md).

## قانون‌های تغییرناپذیر

1. UI و hook فقط **Facade** داخل `src/services/*.service.ts` را صدا می‌زنند. از `features/` هرگز `fetch` / `ky` / `apiClient` صدا نزنید.
2. HTTP فقط در `src/services/api-client.ts` است (`ky` + Bearer + هوک ۴۰۱).
3. لیست‌های صفحه‌بندی‌شده با **TanStack Query** و هوک `useOffsetLimitInfiniteList` کش می‌شوند.
4. مسیر داخلی فقط از **`RouteService`** می‌آید — رشتهٔ `/karvita/...` را در فیچر hardcode نکنید.
5. `NEXT_PUBLIC_API_MODE=mock|real` — شکل Facade یکی است؛ در production مقدار `mock` صریحاً خطا می‌دهد.

```
صفحه (app/)  →  فیچر (features/)  →  Facade (services/*.service.ts)
                                      ├─ mock/   شبیه‌ساز localStorage
                                      └─ real/   apiClient → Nest
                                              ↑
                                    مرورگر: /api/nest  (و /__nest-api → همان)
                                    سرور:   BACKEND_INTERNAL_URL یا NEXT_PUBLIC_API_URL زمان اجرا
                                    سرور:   BACKEND_INTERNAL_URL یا NEXT_PUBLIC_API_URL
```

## Facade چیست و چرا وجود دارد

هر دامنه یک کلاس/آبجکت عمومی دارد (`AuthService`, `OrgStructureService`, …). متدها بر اساس `IS_MOCK_MODE` به پیاده‌سازی mock یا real شاخه می‌شوند.

نفر بعدی اگر بخواهد API عوض کند، **فقط** پوشهٔ `services/{دامنه}/real/` و در صورت نیاز mapper را دست می‌زند. UI نباید بفهمد Nest چه شکلی دارد.

نوع دامنه (`src/types/*.ts`) شکل **فرانت** است. DTOهای خام Nest در `src/types/nest-*.ts` می‌مانند و فقط در mapperهای Facade تبدیل می‌شوند. این جداسازی برای این است که تغییر فیلد Swagger کل فرم‌ها را نشکند.

## HTTP در حالت real

| لایه | فایل | مسئولیت |
|------|------|---------|
| کلاینت | `api-client.ts` | ساخت `ky`، هدر `x-custom-lang: fa`، retry روی ۴۰۱ |
| خطا | `api-error.ts` | `HTTPError` → `ApiClientError` با پیام فارسی |
| توکن | `api-token.ts` | خواندن access از حافظه، refresh مشترک، logout روی ۴۰۱ |
| پروکسی مرورگر | `lib/nest-proxy.ts` + `app/api/nest/[...path]/route.ts` | `/api/nest` تا CORS دامنهٔ Nest بلاک نکند؛ مقصد از env زمان اجرا |
| refresh سمت سرور | `app/api/auth/refresh/route.ts` | تنها جایی که کوکی httpOnly رفرش خوانده می‌شود؛ مثل set/clear با `assertSameOriginPost` |

Access token در حافظهٔ ماژول است (نه `localStorage`) چون XSS به Web Storage دسترسی دارد. Refresh token فقط کوکی httpOnly است و کلاینت هرگز آن را نمی‌بیند.

**تلهٔ ky:** `retry.limit` باید `1` بماند. اگر `0` شود، هوک afterResponse بدنهٔ POST/PATCH را از دست می‌دهد و refresh بی‌صدا خراب می‌شود. توضیح کامل در خود `api-client.ts` است.

## سرور جعلی Nest (`tools/fake-nest`)

برای کار بدون بک‌اند، به‌جای حالت mock داخل برنامه، یک سرور جعلی با همان قرارداد HTTP اجرا کنید و برنامه را در حالت real به آن وصل کنید (ADR شمارهٔ ۱۳):

```bash
pnpm fake-api                       # روی http://localhost:4000/api
# .env.local
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_URL=http://localhost:4000/api
BACKEND_INTERNAL_URL=http://localhost:4000/api
```

- ورود تستی (ادمین و استاد راهنما) هنگام بالا آمدن در لاگ چاپ می‌شود.
- پاسخ‌ها در برابر Swagger اعتبارسنجی می‌شوند؛ `FAKE_NEST_STRICT=false` فقط هشدار می‌دهد.
- `POST /__fake/reset` داده را به seed برمی‌گرداند.
- ورود تستی همه‌ی نقش‌ها در لاگ بالا آمدن چاپ می‌شود (ادمین، استاد راهنما؛ دانشجوها، معلم و مدیر مدرسه در `seed-enrollments.ts`، همه با همان رمز تستی).
- پروکسی `/api/nest` پاسخ بعضی GETهای کاتالوگ (مثل `semesters_all`) را در حافظه‌ی سرور Next کش می‌کند؛ بعد از ریستارت سرور جعلی، Next را هم ریستارت کنید وگرنه شناسه‌های قدیمی دیده می‌شود.
- درس‌های ترمِ تازه در Swagger مستند نیستند؛ پیش‌فرض همان رفتار دیده‌شدهٔ بک‌اند است (فهرست ثابت کارورزی/کارآموزی). `FAKE_NEST_TERM_LESSONS=original` تغییر درخواستی را شبیه‌سازی می‌کند: ساخت از «تعریف دروس» فعال با `originalLessonId`.
- بعد از تغییر بک‌اند: `pnpm fake-api:sync` و سپس `pnpm test`.
- endpoint جدید: فقط با مسیر دقیق Swagger در `tools/fake-nest/handlers/` ثبت کنید و تست قرارداد بنویسید.
- **قرارداد پیشنهادی (هنوز بدون Swagger):** اطلاعیه/تبلیغ (`/api/v1/bulletins*`) در `tools/fake-nest/openapi.proposed.json` تعریف شده تا UI در حالت real دیده شود. این فایل از `fake-api:sync` پاک نمی‌شود؛ وقتی بک‌اند همین مسیرها را در Swagger گذاشت، از آن فایل حذفشان کنید (وگرنه `openapi.ts` خطا می‌دهد) و `real-bulletins.ts` را با قرارداد واقعی تطبیق دهید.

## حالت mock

- داده در `localStorage` / حافظهٔ ماژول شبیه‌ساز است.
- OTP ثابت از `src/services/auth/mock/auth-mock-users.ts` (`MOCK_OTP_CODE`).
- ورود ادمین از `/admin` است؛ `/auth/login` نقش ادمین را عمداً رد می‌کند.
- مجوزهای mock نمایشی‌اند (`mock-authz`). اختیار واقعی همیشه سمت Nest است.

## وضعیت اتصال Nest (واقعی در برابر شبیه‌ساز)

این جدول را وقتی endpoint جدید وصل شد به‌روز کنید.

| Facade | real | یادداشت |
|--------|------|---------|
| `AuthService` | وصل | لاگین، OTP، `/auth/me`، refresh |
| `ProfileService` | وصل | GET/PUT پروفایل + مدرک هویت |
| `FilesService` | وصل | آپلود دو مرحله‌ای presigned + S3 |
| `UsersService` | وصل | CRUD کاربران Nest |
| `OrgStructureService` | وصل | استان/شهر/منطقه/مدرسه/دانشکده/رشته |
| `OrganizationOptionsService` | وصل | typeahead فرم پروفایل و ادمین |
| `SyllabusConfigService` | نسبی | ترم CRUD/گیت، `settings`، `semesters_all`، ارائه درس و `PUT weeks` وصل؛ context انتخاب واحد هنوز mock است. تعریف داینامیک دروس (`*CourseDefinition*`) قطع — real fail-closed |
| `OnboardingApprovalsService` | وصل | صف مدرک از طریق `GET/PATCH /users` |
| `NotificationsService` | وصل | GET/PATCH `v1/notifications` — هدر روی ورود hydrate می‌شود |
| `AdminUserCreationService` | نسبی | ستادی: `POST /admin/admins` (بدون رمز). سازمانی: کاربر باید از قبل وجود داشته باشد (`userId`) |
| `DailyApprovalsService` | نسبی | picker نیم‌سال/درس از `GET semesters_all`؛ هفته از `GET weeks/lesson`؛ mutationهای نمره هنوز fail-closed |
| `InternshipEnrollmentService` | قطع | همین‌طور — صفحه حذف نشود |
| `OrganizationalCapacitiesService` | وصل | استاد راهنما: `GET semesters_all` + `GET/POST/PUT professor-capacities` |
| `LandingCmsService` | وصل | بنر/محصول شناور/شبکهٔ اجتماعی: لیست، ساخت، ویرایش جزئی، حذف |
| `AdminCatalogService` | مرده | استفاده نشود؛ HTTP کاتالوگ از `admin-catalog.api.ts` است |

## کش لیست

جدول‌های ادمین از `useOffsetLimitInfiniteList` استفاده می‌کنند. کلید کش از `resetKey` + `cacheNamespace` ساخته می‌شود. بعد از mutation، invalidate سخت بزنید (timestamp monotonic در org-structure) نه فقط `staleTime: 0` — وگرنه typeahead دادهٔ کهنه نشان می‌دهد.

## مسیر و گیت Edge

- کاتالوگ زنده: `RouteService`
- مسیر IA بدون صفحه: `PlannedRoutes` — در سایدبار نیاید
- سایدبار فقط `LIVE_STATIC_NAV_PATHS` را نشان می‌دهد
- گیت نشست: `src/proxy.ts` (قرارداد Next ۱۶). فایل `middleware.ts` نسازید؛ بیلد می‌شکند
- گیت فقط **وجود** کوکی است، نه نقش. نقش در گارد کلاینت و Nest چک می‌شود
