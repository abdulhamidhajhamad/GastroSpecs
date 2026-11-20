import { Injectable } from "@nestjs/common";
import type { AdminUser as AdminUserRow } from "@prisma/client";
import { PrismaService } from "@/shared/prisma/prisma.service";
import { AdminUser } from "../domain/admin-user.entity";
import { AdminUserRepository } from "../domain/admin-user.repository";

const toAdminUser = (row: AdminUserRow) => new AdminUser(row.id, row.email, row.passwordHash, row.name);

/** The only place Prisma is used for admin users. */
@Injectable()
export class PrismaAdminUserRepository implements AdminUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<AdminUser | null> {
    const row = await this.prisma.adminUser.findUnique({ where: { email } });
    return row && toAdminUser(row);
  }

  async findById(id: string): Promise<AdminUser | null> {
    const row = await this.prisma.adminUser.findUnique({ where: { id } });
    return row && toAdminUser(row);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.adminUser.update({ where: { id }, data: { passwordHash } });
  }
}
