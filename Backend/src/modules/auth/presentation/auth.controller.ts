import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Response } from "express";
import type { CurrentAdmin } from "../application/admin-token";
import { ChangePasswordUseCase } from "../application/change-password.use-case";
import { ChangePasswordDto } from "../application/dto/change-password.dto";
import { SignInDto } from "../application/dto/sign-in.dto";
import { SignInUseCase } from "../application/sign-in.use-case";
import { JwtAuthGuard, SignedInAdmin } from "./jwt-auth.guard";
import { SessionCookie } from "./session-cookie";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly signIn: SignInUseCase,
    private readonly changePassword: ChangePasswordUseCase,
    private readonly sessionCookie: SessionCookie,
  ) {}

  /**
   * Puts the JWT in the session cookie. The token itself is never sent to page JavaScript.
   * Rate limited (429 after 5 tries a minute) so passwords can't be guessed by brute force.
   */
  @Post("sign-in")
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  async signInHandler(@Body() body: SignInDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, expiresAt, admin } = await this.signIn.execute(body.email, body.password);
    this.sessionCookie.set(res, accessToken, expiresAt);
    return admin;
  }

  @Post("sign-out")
  @HttpCode(HttpStatus.NO_CONTENT)
  signOutHandler(@Res({ passthrough: true }) res: Response) {
    this.sessionCookie.clear(res);
  }

  /** Who is signed in. The dashboard calls it before showing any page. */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@SignedInAdmin() admin: CurrentAdmin) {
    return admin;
  }

  @Post("change-password")
  @UseGuards(ThrottlerGuard, JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  changePasswordHandler(@SignedInAdmin() admin: CurrentAdmin, @Body() body: ChangePasswordDto) {
    return this.changePassword.execute(admin.id, body.currentPassword, body.newPassword);
  }
}
