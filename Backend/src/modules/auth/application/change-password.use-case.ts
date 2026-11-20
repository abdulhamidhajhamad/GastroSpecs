import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AdminUserRepository } from "../domain/admin-user.repository";
import { PasswordHasher } from "../domain/password-hasher";

/**
 * Changes the signed-in admin's own password. The current password is required, so a stolen
 * session alone cannot lock the owner out. Only the new hash is stored.
 *
 * Note: tokens issued before the change stay valid until they expire (JWT_EXPIRES_IN).
 */
@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly users: AdminUserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(adminId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.users.findById(adminId);
    // The token was valid but its admin is gone: treat it as a dead session.
    if (!user) throw new UnauthorizedException();

    // 400, not 401: the session is fine, only the typed password is wrong.
    if (!(await this.hasher.verify(currentPassword, user.passwordHash))) {
      throw new BadRequestException("Current password is incorrect");
    }
    if (currentPassword === newPassword) {
      throw new BadRequestException("New password must be different from the current one");
    }

    await this.users.updatePasswordHash(user.id, await this.hasher.hash(newPassword));
  }
}
