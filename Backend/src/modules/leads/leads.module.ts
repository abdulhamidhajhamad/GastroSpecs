import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CreateLeadUseCase } from "./application/create-lead.use-case";
import { ListLeadsUseCase } from "./application/list-leads.use-case";
import { LeadRepository } from "./domain/lead.repository";
import { PrismaLeadRepository } from "./infrastructure/prisma-lead.repository";
import { LeadsController } from "./presentation/leads.controller";

@Module({
  imports: [AuthModule],
  controllers: [LeadsController],
  providers: [CreateLeadUseCase, ListLeadsUseCase, { provide: LeadRepository, useClass: PrismaLeadRepository }],
})
export class LeadsModule {}
