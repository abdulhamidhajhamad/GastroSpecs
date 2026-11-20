import { AdminUser } from "./admin-user.entity";

/** Port the auth use cases depend on. The abstract class doubles as the DI token. */
export abstract class AdminUserRepository {
  abstract findByEmail(email: string): Promise<AdminUser | null>;
  abstract findById(id: string): Promise<AdminUser | null>;
  abstract updatePasswordHash(id: string, passwordHash: string): Promise<void>;
}
