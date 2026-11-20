/**
 * Admin session and API calls, shared by every admin screen.
 * The JWT lives in localStorage: readable by any script on this origin, acceptable for an internal
 * tool with no third-party scripts, but move it to an httpOnly cookie before the dashboard ships publicly.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "gs_admin_token";

/** Mirrors PASSWORD_MIN_LENGTH in the backend's auth/domain/password-policy.ts. */
export const PASSWORD_MIN_LENGTH = 10;

export const session = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** A plain object is sent as JSON; FormData is sent as a file upload. */
  body?: unknown;
  /** Adds the signed-in admin's token. */
  auth?: boolean;
};

/** Calls the API and never throws: network failures come back as status 0. */
export async function apiRequest<T = void>(path: string, { method = "GET", body, auth = false }: RequestOptions = {}): Promise<ApiResult<T>> {
  const token = auth ? session.get() : null;
  const isForm = body instanceof FormData;

  try {
    const res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers: {
        // For FormData the browser sets the multipart Content-Type (with its boundary) itself.
        ...(body !== undefined && !isForm && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
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

export const apiPost = <T = void>(path: string, body: unknown, { auth = false } = {}) =>
  apiRequest<T>(path, { method: "POST", body, auth });

/** Message for a failed admin call; a 401 means the session expired. */
export const failureMessage = (result: { status: number; message: string }) =>
  result.status === 401 ? "Your session has ended. Sign in again." : result.message;
