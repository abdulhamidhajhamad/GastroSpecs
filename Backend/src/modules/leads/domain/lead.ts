export const LEAD_SOURCES = ["catalog_download", "quote", "contact"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

/** What a quote request is for; same values as the site's quote form. */
export const PROJECT_TYPES = ["trader", "fastFood", "central", "hotel", "other"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export type NewLead = {
  email: string | null;
  phone: string | null;
  source: LeadSource;
  name: string | null;
  company: string | null;
  projectType: ProjectType | null;
  message: string | null;
  businessTypeSlug: string | null;
};

export type Lead = Omit<NewLead, "businessTypeSlug" | "projectType"> & {
  id: string;
  projectType: string | null;
  businessType: { slug: string; name: string } | null;
  createdAt: Date;
};
