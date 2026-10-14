/**
 * جدول مسیرها. فقط مسیرهای Swagger ثبت می‌شوند؛ ثبت مسیر ناموجود در قرارداد
 * همان لحظه خطا می‌دهد تا سرور جعلی هرگز از بک‌اند واقعی جلو نزند.
 */
import type { Handler } from './http';
import {
  findOperation,
  specPathParamNames,
  specPathToPattern,
  type HttpMethod,
} from './openapi';

export type RegisteredRoute = {
  method: HttpMethod;
  specPath: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
};

export class Router {
  private readonly routes: RegisteredRoute[] = [];

  register(method: HttpMethod, specPath: string, handler: Handler): void {
    if (!findOperation(method, specPath)) {
      throw new Error(
        `Fake-Nest: ${method.toUpperCase()} ${specPath} در openapi.snapshot.json وجود ندارد.`
      );
    }
    this.routes.push({
      method,
      specPath,
      pattern: specPathToPattern(specPath),
      paramNames: specPathParamNames(specPath),
      handler,
    });
  }

  /** مسیرهای ثبت‌شده — برای تست قرارداد. */
  list(): ReadonlyArray<Pick<RegisteredRoute, 'method' | 'specPath'>> {
    return this.routes.map(({ method, specPath }) => ({ method, specPath }));
  }

  match(
    method: string,
    pathname: string
  ): { route: RegisteredRoute; params: Record<string, string> } | null {
    for (const route of this.routes) {
      if (route.method !== method.toLowerCase()) continue;
      const result = route.pattern.exec(pathname);
      if (!result) continue;
      const params: Record<string, string> = {};
      route.paramNames.forEach((name, index) => {
        params[name] = decodeURIComponent(result[index + 1]!);
      });
      return { route, params };
    }
    return null;
  }

  /** همین مسیر با متد دیگری ثبت شده؟ برای پاسخ ۴۰۵ به‌جای ۴۰۴. */
  pathExists(pathname: string): boolean {
    return this.routes.some((route) => route.pattern.test(pathname));
  }
}
