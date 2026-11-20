export const LEAD_SOURCES = ["catalog_download", "quote"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export type NewLead = {
  email: string | null;
  phone: string | null;
  source: LeadSource;
  businessTypeSlug: string | null;
};

export type Lead = {
  id: string;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  businessType: { slug: string; name: string } | null;
  createdAt: Date;
};
