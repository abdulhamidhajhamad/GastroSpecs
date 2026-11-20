import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import type { CurrentAdmin } from "../application/admin-token";
import { ChangePasswordUseCase } from "../application/change-password.use-case";
import { ChangePasswordDto } from "../application/dto/change-password.dto";
import { SignInDto } from "../application/dto/sign-in.dto";
import { SignInUseCase } from "../application/sign-in.use-case";
import { JwtAuthGuard, SignedInAdmin } from "./jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly signIn: SignInUseCase,
    private readonly changePassword: ChangePasswordUseCase,
  ) {}

  @Post("sign-in")
  @HttpCode(HttpStatus.OK)
  signInHandler(@Body() body: SignInDto) {
    return this.signIn.execute(body.email, body.password);
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  changePasswordHandler(@SignedInAdmin() admin: CurrentAdmin, @Body() body: ChangePasswordDto) {
    return this.changePassword.execute(admin.id, body.currentPassword, body.newPassword);
  }
}
