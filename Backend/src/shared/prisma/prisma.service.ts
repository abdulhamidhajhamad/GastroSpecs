import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma wrapped as an injectable singleton so modules can depend on it through DI.
 * It connects lazily on the first query instead of at startup: Neon sleeps when idle and can take a few
 * seconds to wake, and an eager connect would then crash the whole server on boot.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
