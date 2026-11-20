import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/modules/auth/presentation/jwt-auth.guard";
import { CreateLeadDto } from "../application/dto/create-lead.dto";
import { CreateLeadUseCase } from "../application/create-lead.use-case";
import { ListLeadsUseCase } from "../application/list-leads.use-case";

@Controller("leads")
export class LeadsController {
  constructor(
    private readonly createLead: CreateLeadUseCase,
    private readonly listLeads: ListLeadsUseCase,
  ) {}

  /** Public: called by the site before a catalog PDF download or with a quote request. */
  @Post()
  create(@Body() body: CreateLeadDto) {
    return this.createLead.execute(body);
  }

  /** Admin only: leads hold visitors' emails and phone numbers. */
  @Get()
  @UseGuards(JwtAuthGuard)
  list() {
    return this.listLeads.execute();
  }
}
