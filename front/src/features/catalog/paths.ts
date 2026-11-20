/** Catalog URLs (without locale), in one place so links and routes never drift apart. */
export const catalogPaths = {
  root: "/catalog",
  equipmentView: "/catalog?view=equipment",
  businessType: (slug: string) => `/catalog/business/${slug}`,
  category: (slug: string) => `/catalog/equipment/${slug}`,
};
