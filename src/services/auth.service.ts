import { apiClient, apiRequest } from "./api-client";
import { mockLoginResponse } from "./mocks/auth.mock";
import type { LoginSchema } from "@/lib/schemas";
import type { User } from "@/types";

export interface LoginResponse {
  user: User;
  token: string;
}

// Real NestJS Endpoint: POST /api/v1/auth/login
export const login = (credentials: LoginSchema): Promise<LoginResponse> =>
  apiRequest(
    () =>
      apiClient
        .post<LoginResponse>("/auth/login", credentials)
        .then((res) => res.data),
    mockLoginResponse,
  );
