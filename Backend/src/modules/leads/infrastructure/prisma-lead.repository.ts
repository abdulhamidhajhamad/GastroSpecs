import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@/shared/prisma/prisma.service";
import type { Lead, NewLead } from "../domain/lead";
import { LeadRepository } from "../domain/lead.repository";

const leadInclude = { businessType: true } as const satisfies Prisma.LeadInclude;
type LeadRow = Prisma.LeadGetPayload<{ include: typeof leadInclude }>;

function toLead(row: LeadRow): Lead {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    source: row.source,
    name: row.name,
    company: row.company,
    projectType: row.projectType,
    message: row.message,
    businessType: row.businessType && { slug: row.businessType.slug, name: row.businessType.nameEn },
    createdAt: row.createdAt,
  };
}

@Injectable()
export class PrismaLeadRepository implements LeadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(lead: NewLead): Promise<Lead> {
    // An unknown business type slug is ignored rather than rejected: never lose a lead over it.
    const businessType = lead.businessTypeSlug
      ? await this.prisma.businessType.findUnique({ where: { slug: lead.businessTypeSlug }, select: { id: true } })
      : null;

    const row = await this.prisma.lead.create({
      data: {
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        name: lead.name,
        company: lead.company,
        projectType: lead.projectType,
        message: lead.message,
        businessTypeId: businessType?.id,
      },
      include: leadInclude,
    });
    return toLead(row);
  }

  async list(): Promise<Lead[]> {
    const rows = await this.prisma.lead.findMany({ orderBy: { createdAt: "desc" }, include: leadInclude });
    return rows.map(toLead);
  }
}
