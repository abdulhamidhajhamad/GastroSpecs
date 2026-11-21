import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CatalogModule } from "../catalog/catalog.module";
import { SourcingModule } from "../sourcing/sourcing.module";
import { AgentChatService } from "./application/agent-chat.service";
import { AhmadprodAgent } from "./application/ahmadprod/ahmadprod.agent";
import { ImportPlanExecutor } from "./application/import-plan.executor";
import { AgentChatRepository } from "./domain/agent-chat.repository";
import { AgentModel } from "./domain/agent-model";
import { CatalogPhotos } from "./domain/catalog-photos";
import { ClaudeAgentModel } from "./infrastructure/claude-agent-model";
import { PdfCatalogPhotos } from "./infrastructure/pdf-catalog-photos";
import { PrismaAgentChatRepository } from "./infrastructure/prisma-agent-chat.repository";
import { AgentsController } from "./presentation/agents.controller";

/**
 * AI agents for the dashboard. They use the catalog and sourcing slices through their use cases only,
 * so every rule (validation, codes, duplicates) applies to them exactly as to an admin.
 */
@Module({
  imports: [AuthModule, CatalogModule, SourcingModule],
  controllers: [AgentsController],
  providers: [
    AgentChatService,
    AhmadprodAgent,
    ImportPlanExecutor,
    { provide: AgentChatRepository, useClass: PrismaAgentChatRepository },
    { provide: AgentModel, useClass: ClaudeAgentModel },
    { provide: CatalogPhotos, useClass: PdfCatalogPhotos },
  ],
})
export class AgentsModule {}
