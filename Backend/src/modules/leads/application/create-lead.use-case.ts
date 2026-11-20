import { BadRequestException, Injectable } from "@nestjs/common";
import { LeadRepository } from "../domain/lead.repository";
import type { CreateLeadDto } from "./dto/create-lead.dto";

/** Saves a visitor's contact details. A lead is useless without a way to reach them, so one is required. */
@Injectable()
export class CreateLeadUseCase {
  constructor(private readonly leads: LeadRepository) {}

  execute(input: CreateLeadDto) {
    if (!input.email && !input.phone) {
      throw new BadRequestException("Email or phone is required");
    }

    return this.leads.create({
      email: input.email?.toLowerCase() ?? null,
      phone: input.phone ?? null,
      source: input.source,
      businessTypeSlug: input.businessTypeSlug ?? null,
    });
  }
}
