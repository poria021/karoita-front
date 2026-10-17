/**
 * قرارداد Swagger بک‌اند (`openapi.snapshot.json`) برای سرور جعلی.
 * snapshot دستی به‌روز می‌شود: `pnpm fake-api:sync` از `/docs-json` می‌خواند.
 * اعتبارسنج فقط زیرمجموعهٔ JSON-Schema را که Nest/Swagger تولید می‌کند می‌شناسد
 * (`type`، `properties`، `required`، `items`، `enum`، `nullable`، `allOf`، `$ref`).
 */
import snapshot from './openapi.snapshot.json';
import proposed from './openapi.proposed.json';

export type SchemaObject = {
  $ref?: string;
  type?: string;
  nullable?: boolean;
  enum?: unknown[];
  items?: SchemaObject;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
};

type ContentMap = Record<string, { schema?: SchemaObject }>;

type OperationObject = {
  requestBody?: { content?: ContentMap };
  responses?: Record<string, { content?: ContentMap }>;
  security?: unknown[];
};

type OpenApiDocument = {
  paths: Record<string, Record<string, OperationObject>>;
  components: { schemas: Record<string, SchemaObject> };
};

const doc = snapshot as unknown as OpenApiDocument;

/**
 * مسیرهای «پیشنهادی» که هنوز در Swagger بک‌اند نیستند (`openapi.proposed.json`).
 * اگر بک‌اند همان مسیر را منتشر کرد و snapshot آن را گرفت، اینجا خطا می‌دهیم تا
 * نسخهٔ پیشنهادی بی‌صدا نسخهٔ واقعی را نپوشاند و فایل پیشنهادی پاک شود.
 */
const proposedDoc = proposed as unknown as {
  paths: OpenApiDocument['paths'];
  schemas: OpenApiDocument['components']['schemas'];
};
for (const [path, item] of Object.entries(proposedDoc.paths)) {
  if (doc.paths[path]) {
    throw new Error(
      `Fake-Nest: ${path} هم در snapshot هست هم در openapi.proposed.json؛ از فایل پیشنهادی حذفش کنید.`
    );
  }
  doc.paths[path] = item;
}
Object.assign(doc.components.schemas, proposedDoc.schemas);

export const PROPOSED_PATHS: readonly string[] = Object.keys(proposedDoc.paths);

export const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

/**
 * فیلدهایی که Swagger «الزامی و non-null» اعلام کرده ولی API واقعی برای کاربر عادی
 * خالی/null برمی‌گرداند. فقط همین‌ها در اعتبارسنجی تحمل می‌شوند؛ هر مورد جدید باید
 * با دلیل اینجا بیاید، نه اینکه اعتبارسنج شل شود.
 */
const KNOWN_SPEC_GAPS: ReadonlySet<string> = new Set([
  // کاربر حذف‌نشده تاریخ حذف ندارد؛ Swagger آن را date-time الزامی نوشته.
  'User.deletedAt',
  // کاربری که عکس پروفایل نگذاشته.
  'User.photo',
]);

/**
 * فیلدهایی که Swagger نوعشان را غلط نوشته ولی بک‌اند زنده مقدار درست می‌دهد:
 * شناسه/تاریخ‌های ثبت‌نام `object` تایپ شده‌اند، و `weekId` هفته‌ی دانشجو (طبق خلاصه‌ی
 * خود Swagger «populated with its week definition») سند هفته است نه string.
 * فقط بررسی نوع این فیلدها رد می‌شود؛ الزامی/null بودن هنوز چک می‌شود.
 */
const KNOWN_TYPE_GAPS: ReadonlySet<string> = new Set([
  'StudentEnrollment.schoolId',
  'StudentEnrollment.teacherId',
  'StudentEnrollment.completedAt',
  'StudentEnrollment.schoolAdminId',
  'StudentWeekResponseDto.weekId',
]);

export function listOperations(): Array<{ method: HttpMethod; path: string }> {
  const out: Array<{ method: HttpMethod; path: string }> = [];
  for (const [path, item] of Object.entries(doc.paths)) {
    for (const method of HTTP_METHODS) {
      if (item[method]) out.push({ method, path });
    }
  }
  return out;
}

export function findOperation(
  method: HttpMethod,
  path: string
): OperationObject | null {
  return doc.paths[path]?.[method] ?? null;
}

/** مسیر OpenAPI با پارامتر (`/api/x/{id}`) را به regex تبدیل می‌کند. */
export function specPathToPattern(path: string): RegExp {
  const source = path
    .split(/(\{[^}]+\})/)
    .map((part) =>
      part.startsWith('{')
        ? '([^/]+)'
        : part.replace(/[.*+?^$()|[\]\\]/g, '\\$&')
    )
    .join('');
  return new RegExp(`^${source}$`);
}

/** نام پارامترهای مسیر به ترتیب (`/a/{id}/b/{x}` → `['id','x']`). */
export function specPathParamNames(path: string): string[] {
  return [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]!);
}

function resolveRefNamed(ref: string): { name: string; schema: SchemaObject } {
  const name = ref.replace('#/components/schemas/', '');
  const schema = doc.components.schemas[name];
  if (!schema) throw new Error(`Swagger schema not found: ${name}`);
  return { name, schema };
}

function describe(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/** خطاهای اعتبارسنجی مقدار در برابر schema؛ آرایهٔ خالی یعنی معتبر. */
export function validateAgainstSchema(
  value: unknown,
  schema: SchemaObject,
  at = '$',
  owner?: string
): string[] {
  if (schema.$ref) {
    const resolved = resolveRefNamed(schema.$ref);
    return validateAgainstSchema(value, resolved.schema, at, resolved.name);
  }

  if (value === null || value === undefined) {
    return schema.nullable ? [] : [`${at}: مقدار خالی مجاز نیست`];
  }

  if (schema.allOf) {
    return schema.allOf.flatMap((part) =>
      validateAgainstSchema(value, part, at, owner)
    );
  }
  const alternatives = schema.oneOf ?? schema.anyOf;
  if (alternatives) {
    const results = alternatives.map((part) =>
      validateAgainstSchema(value, part, at, owner)
    );
    return results.some((errors) => errors.length === 0)
      ? []
      : [`${at}: با هیچ‌کدام از حالت‌های schema نمی‌خواند`];
  }

  const errors: string[] = [];
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${at}: «${String(value)}» جزو enum نیست`);
  }

  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push(`${at}: باید string باشد، ${describe(value)} است`);
      }
      break;
    case 'number':
    case 'integer':
      if (typeof value !== 'number') {
        errors.push(`${at}: باید number باشد، ${describe(value)} است`);
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${at}: باید boolean باشد، ${describe(value)} است`);
      }
      break;
    case 'array':
      if (!Array.isArray(value)) {
        errors.push(`${at}: باید array باشد، ${describe(value)} است`);
      } else if (schema.items) {
        const items = schema.items;
        value.forEach((item, index) => {
          errors.push(...validateAgainstSchema(item, items, `${at}[${index}]`));
        });
      }
      break;
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`${at}: باید object باشد، ${describe(value)} است`);
        break;
      }
      for (const key of schema.required ?? []) {
        if (!(key in value) && !KNOWN_SPEC_GAPS.has(`${owner}.${key}`)) {
          errors.push(`${at}.${key}: فیلد الزامی نیست`);
        }
      }
      for (const [key, child] of Object.entries(schema.properties ?? {})) {
        if (!(key in value)) continue;
        const childValue = (value as Record<string, unknown>)[key];
        if (childValue === null && KNOWN_SPEC_GAPS.has(`${owner}.${key}`)) {
          continue;
        }
        if (childValue !== null && KNOWN_TYPE_GAPS.has(`${owner}.${key}`)) continue;
        errors.push(
          ...validateAgainstSchema(childValue, child, `${at}.${key}`)
        );
      }
      break;
    default:
      break;
  }
  return errors;
}

/** schema پاسخ موفق (`2xx`) عملیات؛ `schema: null` یعنی بدنه‌ای تعریف نشده. */
export function successResponseSchema(
  method: HttpMethod,
  path: string
): { status: number; schema: SchemaObject | null } | null {
  const operation = findOperation(method, path);
  if (!operation?.responses) return null;
  const code = Object.keys(operation.responses).find((status) =>
    status.startsWith('2')
  );
  if (!code) return null;
  const content = operation.responses[code]?.content;
  const schema = content ? (Object.values(content)[0]?.schema ?? null) : null;
  return { status: Number(code), schema };
}

/** schema بدنهٔ JSON درخواست؛ `null` یعنی بدنه‌ای تعریف نشده. */
export function requestBodySchema(
  method: HttpMethod,
  path: string
): SchemaObject | null {
  const content = findOperation(method, path)?.requestBody?.content;
  if (!content) return null;
  return (
    content['application/json']?.schema ??
    Object.values(content)[0]?.schema ??
    null
  );
}

export function operationRequiresAuth(
  method: HttpMethod,
  path: string
): boolean {
  const security = findOperation(method, path)?.security;
  return Array.isArray(security) && security.length > 0;
}
