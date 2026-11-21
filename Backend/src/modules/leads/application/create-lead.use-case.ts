import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Mailer } from "@/shared/mail/mailer";
import { LeadRepository } from "../domain/lead.repository";
import type { CreateLeadDto } from "./dto/create-lead.dto";
import { leadEmail } from "./lead-email";

const DEFAULT_SALES_EMAIL = "sales@gastrospecs.com";

/** What each form must contain, beyond a way to reach the visitor. */
const REQUIRED: Record<CreateLeadDto["source"], (keyof CreateLeadDto)[]> = {
  quote: ["company"],
  contact: ["name", "message"],
  catalog_download: [],
};

/**
 * Saves a visitor's request, then emails it to the sales inbox. Saved first so nothing is lost if the
 * email fails; a failed email is logged and never shown to the visitor.
 */
@Injectable()
export class CreateLeadUseCase {
  private readonly logger = new Logger(CreateLeadUseCase.name);

  constructor(
    private readonly leads: LeadRepository,
    private readonly mailer: Mailer,
    private readonly config: ConfigService,
  ) {}

  async execute(input: CreateLeadDto): Promise<{ received: true }> {
    // Bots fill the hidden field: answer as usual so they don't learn anything, but keep nothing.
    if (input.website) return { received: true };

    if (!input.email && !input.phone) throw new BadRequestException("Email or phone is required");
    const missing = REQUIRED[input.source].filter((field) => !input[field]);
    if (missing.length) throw new BadRequestException(`Missing: ${missing.join(", ")}`);

    const lead = await this.leads.create({
      email: input.email?.toLowerCase() ?? null,
      phone: input.phone ?? null,
      source: input.source,
      name: input.name ?? null,
      company: input.company ?? null,
      projectType: input.projectType ?? null,
      message: input.message ?? null,
      businessTypeSlug: input.businessTypeSlug ?? null,
    });

    const to = this.config.get<string>("LEADS_EMAIL_TO") || DEFAULT_SALES_EMAIL;
    try {
      await this.mailer.send(leadEmail(lead, to, { page: input.page, locale: input.locale }));
    } catch (error) {
      this.logger.error(`Lead ${lead.id} saved but its email failed: ${error instanceof Error ? error.message : error}`);
    }
    return { received: true };
  }
}
