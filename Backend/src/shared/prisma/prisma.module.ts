import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/**
 * @Global so any module can inject PrismaService without re-importing this module.
 * One shared Prisma connection pool for the whole app.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
