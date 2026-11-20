import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AdminUserRepository } from "../domain/admin-user.repository";
import { PasswordHasher } from "../domain/password-hasher";
import type { AdminTokenPayload, CurrentAdmin } from "./admin-token";

export type SignInResult = {
  accessToken: string;
  /** When the token stops being valid, so the session cookie can expire at the same moment. */
  expiresAt: Date;
  admin: CurrentAdmin;
};

/**
 * Signs an admin in and issues a JWT.
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
    const accessToken = await this.jwt.signAsync(payload);
    const { exp } = this.jwt.decode<{ exp: number }>(accessToken);

    return { accessToken, expiresAt: new Date(exp * 1000), admin: { id: user.id, email: user.email } };
  }
}
