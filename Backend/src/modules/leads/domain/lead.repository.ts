import type { Lead, NewLead } from "./lead";

export abstract class LeadRepository {
  abstract create(lead: NewLead): Promise<Lead>;
  /** Newest first. */
  abstract list(): Promise<Lead[]>;
}
