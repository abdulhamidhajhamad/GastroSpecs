import { Module } from "@nestjs/common";
import { JwtModule, type JwtSignOptions } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
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
    // Password guessing: 5 attempts per minute per visitor (see AuthController). Kept in memory, which is
    // enough for one server; a shared store is needed only when the API runs on several instances.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        // A duration like "7d" or "12h" (or seconds as a number).
        signOptions: { expiresIn: (config.get<string>("JWT_EXPIRES_IN") ?? "7d") as JwtSignOptions["expiresIn"] },
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
