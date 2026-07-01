// TODO (Backend Intercept): Replace with NestJS base API endpoint and Interceptors later.
//
// This is a placeholder HTTP client used to centralize outgoing requests to the
// backend. Once the NestJS API is available, this class should be swapped for a
// proper client (e.g. axios instance) configured with base URL, auth headers,
// request/response interceptors, and centralized error handling.

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      ...init,
    });

    return response.json() as Promise<T>;
  }

  async post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      ...init,
    });

    return response.json() as Promise<T>;
  }
}

// Dummy base instance, safe to import anywhere. Behavior is expected to change
// once the real backend is wired up.
export const apiClient = new ApiClient();
