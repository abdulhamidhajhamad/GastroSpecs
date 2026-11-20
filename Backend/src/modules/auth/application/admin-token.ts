/** What a signed-in admin's JWT carries. Written by sign-in, read by the auth guard. */
export type AdminTokenPayload = { sub: string; email: string };

/** The signed-in admin, as the guard attaches it to the request. */
export type CurrentAdmin = { id: string; email: string };
