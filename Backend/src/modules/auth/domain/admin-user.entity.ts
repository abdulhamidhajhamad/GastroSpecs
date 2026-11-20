/**
 * Domain entity — represents an admin user in business terms, independent of Prisma.
 * The application layer talks about AdminUser; the infrastructure layer maps Prisma rows into it.
 */
export class AdminUser {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly name: string | null,
  ) {}
}
