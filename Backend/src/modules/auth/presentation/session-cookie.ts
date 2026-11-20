import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CookieOptions, Response } from "express";

export const SESSION_COOKIE = "gs_admin_session";

/**
 * The signed-in admin's JWT travels in this cookie, never in page JavaScript:
 * - httpOnly: scripts on the page cannot read it, so an injected script cannot steal it.
 * - sameSite strict: browsers only send it from our own site (gastrospecs.com and its subdomains),
 *   which blocks other sites from making requests as the admin (CSRF).
 * - path /api: sent to the API only, not with every page request.
 * - domain: COOKIE_DOMAIN in production (".gastrospecs.com") so the site and api. subdomain share it;
 *   empty locally, where localhost:3000 and localhost:4000 already share cookies.
 */
@Injectable()
export class SessionCookie {
  private readonly options: CookieOptions;

  constructor(config: ConfigService) {
    this.options = {
      httpOnly: true,
      secure: config.get<string>("NODE_ENV") === "production",
      sameSite: "strict",
      path: "/api",
      domain: config.get<string>("COOKIE_DOMAIN") || undefined,
    };
  }

  set(res: Response, token: string, expiresAt: Date): void {
    res.cookie(SESSION_COOKIE, token, { ...this.options, expires: expiresAt });
  }

  clear(res: Response): void {
    res.clearCookie(SESSION_COOKIE, this.options);
  }
}
