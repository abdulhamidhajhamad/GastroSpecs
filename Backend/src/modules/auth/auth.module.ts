import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ChangePasswordUseCase } from "./application/change-password.use-case";
import { SignInUseCase } from "./application/sign-in.use-case";
import { AdminUserRepository } from "./domain/admin-user.repository";
import { PasswordHasher } from "./domain/password-hasher";
import { BcryptPasswordHasher } from "./infrastructure/bcrypt-password-hasher";
import { PrismaAdminUserRepository } from "./infrastructure/prisma-admin-user.repository";
import { AuthController } from "./presentation/auth.controller";
import { JwtAuthGuard } from "./presentation/jwt-auth.guard";
import { SessionCookie } from "./presentation/session-cookie";

/**
 * Auth vertical slice: controller → use cases → ports ← adapters (Prisma, bcrypt).
 * Exports JwtAuthGuard (with the JwtModule it needs) so other slices can protect admin routes.
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: { expiresIn: config.get<string>("JWT_EXPIRES_IN") ?? "7d" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    SignInUseCase,
    ChangePasswordUseCase,
    JwtAuthGuard,
    SessionCookie,
    { provide: AdminUserRepository, useClass: PrismaAdminUserRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
  ],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
