import axios from "axios";

export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const simulateLatency = <T>(data: T, delayMs = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delayMs));

/**
 * Routes a call through the real NestJS backend, or resolves `mockData`
 * when NEXT_PUBLIC_USE_MOCK_API=true. Every service function should go
 * through this so switching between mock/real API is a single env flag.
 */
export async function apiRequest<T>(
  request: () => Promise<T>,
  mockData: T,
): Promise<T> {
  if (USE_MOCK_API) {
    return simulateLatency(mockData);
  }
  return request();
}
