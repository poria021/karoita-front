import type { LoginResponse } from "../auth.service";

export const mockLoginResponse: LoginResponse = {
  user: {
    id: "mock-user-1",
    name: "کاربر آزمایشی",
    email: "student@karvitaa.test",
    role: "student",
  },
  token: "mock-jwt-token",
};
