import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, createParamDecorator } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import type { AdminTokenPayload, CurrentAdmin } from "../application/admin-token";
import { SESSION_COOKIE } from "./session-cookie";

type AuthenticatedRequest = Request & { admin?: CurrentAdmin };

/**
 * Lets a request through only with a valid session cookie (see SessionCookie),
 * and attaches the signed-in admin to it. Use with @UseGuards(JwtAuthGuard).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token: unknown = request.cookies?.[SESSION_COOKIE];
    if (typeof token !== "string" || !token) throw new UnauthorizedException();

    try {
      const payload = await this.jwt.verifyAsync<AdminTokenPayload>(token);
      request.admin = { id: payload.sub, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

/** The admin attached by JwtAuthGuard. Only valid on guarded routes. */
export const SignedInAdmin = createParamDecorator(
  (_: unknown, context: ExecutionContext): CurrentAdmin =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().admin as CurrentAdmin,
);
