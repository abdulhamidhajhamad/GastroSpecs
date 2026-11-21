import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./shared/prisma/prisma.module";
import { StorageModule } from "./shared/storage/storage.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { HealthModule } from "./modules/health/health.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { SourcingModule } from "./modules/sourcing/sourcing.module";
import { AgentsModule } from "./modules/agents/agents.module";

/**
 * Root module. Composition only — no business logic lives here.
 * Each feature is a vertical slice under modules/ with its own
 * domain / application / infrastructure / presentation layers.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuthModule,
    CatalogModule,
    LeadsModule,
    SourcingModule,
    AgentsModule,
    HealthModule,
  ],
})
export class AppModule {}
