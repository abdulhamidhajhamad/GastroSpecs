import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
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

  /** Public: the site's quote and contact forms (and catalog downloads). A few per minute per visitor, against spam. */
  @Post()
  @HttpCode(201)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
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
