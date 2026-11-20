import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AdminUserRepository } from "../domain/admin-user.repository";
import { PasswordHasher } from "../domain/password-hasher";
import type { AdminTokenPayload } from "./admin-token";

export type SignInResult = {
  accessToken: string;
  user: { id: string; email: string; name: string | null };
};

/**
 * Signs an admin in and returns a JWT.
 * "Unknown email" and "wrong password" give the same error, so the response never reveals which emails exist.
 */
@Injectable()
export class SignInUseCase {
  constructor(
    private readonly users: AdminUserRepository,
    private readonly hasher: PasswordHasher,
    private readonly jwt: JwtService,
  ) {}

  async execute(email: string, password: string): Promise<SignInResult> {
    const user = await this.users.findByEmail(email.toLowerCase());
    const passwordOk = user ? await this.hasher.verify(password, user.passwordHash) : false;

    if (!user || !passwordOk) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const payload: AdminTokenPayload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
