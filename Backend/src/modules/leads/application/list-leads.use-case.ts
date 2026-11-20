import { Injectable } from "@nestjs/common";
import { LeadRepository } from "../domain/lead.repository";

/** Leads for the dashboard. */
@Injectable()
export class ListLeadsUseCase {
  constructor(private readonly leads: LeadRepository) {}

  execute() {
    return this.leads.list();
  }
}
