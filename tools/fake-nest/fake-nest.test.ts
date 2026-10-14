// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { SEED_ADMIN_PHONE, SEED_MENTOR_PHONE, SEED_PASSWORD } from "./seed";
import type { FakeNest } from "./server";
import { startFake, type FakeHarness } from "./test-helpers";
import {
  findOperation,
  listOperations,
  validateAgainstSchema,
} from "./openapi";

let harness: FakeHarness;
let fake: FakeNest;
const call: FakeHarness["call"] = (method, path, options) =>
  harness.call(method, path, options);
let base = "";
const adminToken = () => harness.adminToken();

async function uploadFile(
  token: string,
  name: string,
  bytes: Buffer,
): Promise<string> {
  const created = await call("POST", "/api/v1/files/upload", {
    token,
    body: { fileName: name, fileSize: bytes.length, mimeType: "image/png" },
  });
  expect(created.status).toBe(201);
  const { file, uploadSignedUrl } = created.json as {
    file: { id: string };
    uploadSignedUrl: string;
  };
  const put = await fetch(uploadSignedUrl, {
    method: "PUT",
    body: new Uint8Array(bytes),
  });
  expect(put.status).toBe(200);
  const confirmed = await call("PATCH", `/api/v1/files/${file.id}/confirm`, {
    token,
    body: {},
  });
  expect(confirmed.status).toBe(200);
  return file.id;
}

beforeAll(async () => {
  harness = await startFake();
  fake = harness.fake;
  base = harness.base;
});

afterAll(async () => {
  await harness.close();
});

beforeEach(async () => {
  await harness.reset();
});

describe("قرارداد با Swagger", () => {
  it("هر مسیر ثبت‌شده یک عملیات واقعی Swagger است", () => {
    for (const { method, specPath } of fake.router.list()) {
      expect(
        findOperation(method, specPath),
        `${method} ${specPath}`,
      ).not.toBeNull();
    }
  });

  it("ثبت مسیر ناموجود در Swagger خطا می‌دهد", () => {
    expect(() =>
      fake.router.register("get", "/api/does-not-exist", () => ({
        status: 200,
      })),
    ).toThrow(/openapi\.snapshot\.json/);
  });

  it("snapshot دست‌کم ۱۰۰ عملیات دارد (خالی/خراب نیست)", () => {
    expect(listOperations().length).toBeGreaterThan(100);
  });
});

describe("اعتبارسنج schema", () => {
  const schema = {
    type: "object",
    required: ["id", "role"],
    properties: {
      id: { type: "string" },
      role: { type: "string", enum: ["admin", "superadmin"] },
      note: { type: "string", nullable: true },
    },
  };

  it("فیلد الزامی، نوع و enum را می‌گیرد", () => {
    expect(validateAgainstSchema({ id: 1, role: "x" }, schema)).toEqual([
      "$.id: باید string باشد، number است",
      "$.role: «x» جزو enum نیست",
    ]);
    expect(validateAgainstSchema({ role: "admin" }, schema)).toEqual([
      "$.id: فیلد الزامی نیست",
    ]);
  });

  it("null فقط وقتی nullable است مجاز است", () => {
    expect(
      validateAgainstSchema({ id: "a", role: "admin", note: null }, schema),
    ).toEqual([]);
    expect(
      validateAgainstSchema({ id: null, role: "admin" }, schema),
    ).toHaveLength(1);
  });
});

describe("ورود و نشست", () => {
  it("ورود ادمین توکن و پروفایل می‌دهد و /me همان را برمی‌گرداند", async () => {
    const login = await call(
      "POST",
      "/api/v1/admin/auth/phone/login/password",
      {
        body: { phone: `0${SEED_ADMIN_PHONE}`, password: SEED_PASSWORD },
      },
    );
    expect(login.status).toBe(200);
    const { token, admin } = login.json as {
      token: string;
      admin: { role: string };
    };
    expect(admin.role).toBe("superadmin");

    const me = await call("GET", "/api/v1/admin/auth/me", { token });
    expect(me.status).toBe(200);
    expect((me.json as { phone: string }).phone).toBe(SEED_ADMIN_PHONE);
  });

  it("رمز اشتباه ۴۲۲ هم‌شکل Nest می‌دهد", async () => {
    const result = await call(
      "POST",
      "/api/v1/admin/auth/phone/login/password",
      {
        body: { phone: SEED_ADMIN_PHONE, password: "wrong-password" },
      },
    );
    expect(result.status).toBe(422);
    expect(result.json).toEqual({
      status: 422,
      errors: { password: "incorrectPassword" },
    });
  });

  it("بدنهٔ ناقص قبل از handler رد می‌شود", async () => {
    const result = await call(
      "POST",
      "/api/v1/admin/auth/phone/login/password",
      {
        body: { phone: SEED_ADMIN_PHONE },
      },
    );
    expect(result.status).toBe(422);
    expect(
      (result.json as { errors: Record<string, string> }).errors.password,
    ).toBeDefined();
  });

  it("کاربر عادی با /me ادمین ۴۰۳ می‌گیرد و بدون توکن ۴۰۱", async () => {
    const login = await call("POST", "/api/v1/auth/phone/login/password", {
      body: { phone: `0${SEED_MENTOR_PHONE}`, password: SEED_PASSWORD },
    });
    expect(login.status).toBe(200);
    const token = (login.json as { token: string }).token;
    expect((await call("GET", "/api/v1/admin/auth/me", { token })).status).toBe(
      403,
    );
    expect((await call("GET", "/api/v1/auth/me")).status).toBe(401);
    expect((await call("GET", "/api/v1/auth/me", { token })).status).toBe(200);
  });

  it("refresh فقط با refresh token کار می‌کند و توکن قبلی را باطل می‌کند", async () => {
    const login = await call(
      "POST",
      "/api/v1/admin/auth/phone/login/password",
      {
        body: { phone: SEED_ADMIN_PHONE, password: SEED_PASSWORD },
      },
    );
    const { token, refreshToken } = login.json as {
      token: string;
      refreshToken: string;
    };

    expect(
      (await call("POST", "/api/v1/admin/auth/refresh", { token })).status,
    ).toBe(401);

    const rotated = await call("POST", "/api/v1/admin/auth/refresh", {
      token: refreshToken,
    });
    expect(rotated.status).toBe(200);
    expect((await call("GET", "/api/v1/admin/auth/me", { token })).status).toBe(
      401,
    );
    expect(
      (
        await call("POST", "/api/v1/admin/auth/refresh", {
          token: refreshToken,
        })
      ).status,
    ).toBe(401);
  });

  it("logout نشست را باطل می‌کند", async () => {
    const token = await adminToken();
    expect(
      (await call("POST", "/api/v1/admin/auth/logout", { token })).status,
    ).toBe(204);
    expect((await call("GET", "/api/v1/admin/auth/me", { token })).status).toBe(
      401,
    );
  });
});

describe("آپلود فایل", () => {
  it("confirm قبل از PUT بایت‌ها ۴۰۰ است", async () => {
    const token = await adminToken();
    const created = await call("POST", "/api/v1/files/upload", {
      token,
      body: { fileName: "a.png", fileSize: 3, mimeType: "image/png" },
    });
    const id = (created.json as { file: { id: string } }).file.id;
    const confirm = await call("PATCH", `/api/v1/files/${id}/confirm`, {
      token,
      body: {},
    });
    expect(confirm.status).toBe(400);
  });

  it("سه مرحله‌ای کامل می‌شود و فایل قابل دریافت است", async () => {
    const token = await adminToken();
    const id = await uploadFile(token, "a.png", Buffer.from("png-bytes"));
    const stored = fake.store().files.get(id)!;
    expect(stored.status).toBe("confirmed");
    const get = await fetch(`${base}/storage/${id}`);
    expect(await get.text()).toBe("png-bytes");
  });
});

describe("CMS لندینگ", () => {
  it("GET عمومی است ولی نوشتن توکن می‌خواهد", async () => {
    const list = await call(
      "GET",
      "/api/admin/slider-banners?page=1&limit=100",
    );
    expect(list.status).toBe(200);
    expect((list.json as { data: unknown[] }).data).toHaveLength(3);

    const noToken = await call("POST", "/api/admin/slider-banners", {
      body: { picture: { id: "x" }, title: "test" },
    });
    expect(noToken.status).toBe(401);

  });

  it("صفحه‌بندی hasNextPage را درست می‌دهد", async () => {
    const page = await call("GET", "/api/admin/slider-banners?page=1&limit=2");
    const body = page.json as { data: unknown[]; hasNextPage: boolean };
    expect(body.data).toHaveLength(2);
    expect(body.hasNextPage).toBe(true);
  });

  it("ساخت بنر، ویرایش جزئی (تصویر دست‌نخورده) و حذف", async () => {
    const token = await adminToken();
    const pictureId = await uploadFile(token, "b.png", Buffer.from("b"));

    const created = await call("POST", "/api/admin/slider-banners", {
      token,
      body: { picture: { id: pictureId }, title: "بنر تازه", link: "/x" },
    });
    expect(created.status).toBe(201);
    const banner = created.json as { id: string; picture: { id: string } };
    expect(banner.picture.id).toBe(pictureId);

    const patched = await call(
      "PATCH",
      `/api/admin/slider-banners/${banner.id}`,
      {
        token,
        body: { title: "عنوان جدید" },
      },
    );
    expect(patched.status).toBe(200);
    expect(patched.json).toMatchObject({
      title: "عنوان جدید",
      link: "/x",
      picture: { id: pictureId },
    });

    expect(
      (
        await call("DELETE", `/api/admin/slider-banners/${banner.id}`, {
          token,
        })
      ).status,
    ).toBe(204);
    expect(
      (await call("GET", `/api/admin/slider-banners/${banner.id}`)).status,
    ).toBe(404);
  });

  it("عنوان الزامی بنر قبل از ساخت اعتبارسنجی می‌شود", async () => {
    const token = await adminToken();
    const result = await call("POST", "/api/admin/slider-banners", {
      token,
      body: { picture: { id: "x" } },
    });
    expect(result.status).toBe(422);
    expect(
      (result.json as { errors: Record<string, string> }).errors.title,
    ).toBeDefined();
  });

  it("تصویر ناموجود یا تأییدنشده ۴۲۲ است", async () => {
    const token = await adminToken();
    const result = await call("POST", "/api/admin/floating-products", {
      token,
      body: { picture: { id: "nope" }, title: "محصول", link: "/auth/login" },
    });
    expect(result.status).toBe(422);
    expect(result.json).toMatchObject({
      errors: { picture: expect.any(String) },
    });
  });

  it("آیکون شبکهٔ اجتماعی با picture: null برداشته می‌شود، ولی بنر نه", async () => {
    const token = await adminToken();
    const socials = await call("GET", "/api/admin/social-networks");
    const first = (
      socials.json as { data: Array<{ id: string; picture: unknown }> }
    ).data[0]!;
    expect(first.picture).not.toBeNull();

    const cleared = await call(
      "PATCH",
      `/api/admin/social-networks/${first.id}`,
      {
        token,
        body: { picture: null },
      },
    );
    expect(cleared.status).toBe(200);
    expect((cleared.json as { picture: unknown }).picture).toBeNull();

    const banners = await call("GET", "/api/admin/slider-banners");
    const banner = (banners.json as { data: Array<{ id: string }> }).data[0]!;
    const bad = await call("PATCH", `/api/admin/slider-banners/${banner.id}`, {
      token,
      body: { picture: null },
    });
    expect(bad.status).toBe(422);
  });
});

describe("اعلان‌ها و کنترل", () => {
  it("اعلان خوانده‌شده برای همان کاربر ثبت می‌شود", async () => {
    const token = await adminToken();
    const list = await call("GET", "/api/v1/notifications", { token });
    const first = (
      list.json as { data: Array<{ id: string; isRead: boolean }> }
    ).data[0]!;
    expect(first.isRead).toBe(false);
    const read = await call("PATCH", `/api/v1/notifications/${first.id}/read`, {
      token,
      body: {},
    });
    expect((read.json as { isRead: boolean }).isRead).toBe(true);
  });

  it("مسیر ناشناس ۴۰۴ و متد اشتباه ۴۰۵ می‌دهد", async () => {
    expect((await call("GET", "/api/nope")).status).toBe(404);
    expect((await call("DELETE", "/api/v1/auth/me")).status).toBe(405);
  });

  it("reset داده را به seed برمی‌گرداند", async () => {
    const token = await adminToken();
    const banners = (await call("GET", "/api/admin/slider-banners")).json as {
      data: Array<{ id: string }>;
    };
    await call("DELETE", `/api/admin/slider-banners/${banners.data[0]!.id}`, {
      token,
    });
    await call("POST", "/__fake/reset");
    const after = (await call("GET", "/api/admin/slider-banners")).json as {
      data: unknown[];
    };
    expect(after.data).toHaveLength(3);
  });
});
