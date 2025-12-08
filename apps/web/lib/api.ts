const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    return response.ok;
  } catch {
    return false;
  }
}

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "csrf_token") {
      return value;
    }
  }
  return null;
}

export async function api<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const csrfToken = getCsrfToken();

  const headers: Record<string, string> = {
    ...(options?.body ? { "Content-Type": "application/json" } : {}),
    ...(options?.headers as Record<string, string>),
  };

  // Add CSRF token for mutating requests
  if (
    csrfToken &&
    options?.method &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(options.method.toUpperCase())
  ) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  // If unauthorized, try to refresh token
  if (response.status === 401 && endpoint !== "/auth/refresh") {
    // Prevent multiple refresh attempts
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      // Retry original request
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers,
      });

      if (!retryResponse.ok) {
        throw new ApiError(retryResponse.status, "Request failed");
      }

      return retryResponse.json();
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, "Request failed");
  }

  return response.json();
}
