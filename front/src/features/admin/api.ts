/**
 * API calls for the admin screens. The session is an httpOnly cookie set by the API on sign-in:
 * this code never sees the token, it only asks the browser to send cookies (`credentials: "include"`).
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Mirrors PASSWORD_MIN_LENGTH in the backend's auth/domain/password-policy.ts. */
export const PASSWORD_MIN_LENGTH = 10;

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** A plain object is sent as JSON; FormData is sent as a file upload. */
  body?: unknown;
};

/** Calls the API and never throws: network failures come back as status 0. */
export async function apiRequest<T = void>(path: string, { method = "GET", body }: RequestOptions = {}): Promise<ApiResult<T>> {
  const isForm = body instanceof FormData;

  try {
    const res = await fetch(`${API_URL}/api${path}`, {
      method,
      credentials: "include",
      // For FormData the browser sets the multipart Content-Type (with its boundary) itself.
      headers: body !== undefined && !isForm ? { "Content-Type": "application/json" } : undefined,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });

    if (res.ok) {
      const data = res.status === 204 ? undefined : await res.json();
      return { ok: true, data: data as T };
    }

    const error = await res.json().catch(() => null);
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;
    return { ok: false, status: res.status, message: message ?? "Something went wrong." };
  } catch {
    return { ok: false, status: 0, message: "Could not reach the server. Is the API running?" };
  }
}

export const apiPost = <T = void>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body });

/** Message for a failed admin call; a 401 means the session expired. */
export const failureMessage = (result: { status: number; message: string }) =>
  result.status === 401 ? "Your session has ended. Sign in again." : result.message;
