/** The backend's address, for calls made from the browser (forms, admin screens). */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Full URL of an API path, e.g. apiUrl("/leads"). */
export const apiUrl = (path: string) => `${API_URL}/api${path}`;
