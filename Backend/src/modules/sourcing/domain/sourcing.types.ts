/**
 * Sourcing: who makes our products and what they cost us. Admin-only data, never on the public site.
 * Plain types: no ORM, no HTTP.
 */

/** `amount` is in the smallest currency unit (cents). */
export type Money = { amount: number; currency: string };

export type SupplierFields = {
  name: string;
  nameLocal: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

export type ContactFields = {
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  wechat: string | null;
  notes: string | null;
};

export type Contact = ContactFields & { id: string };

/** What a create needs: the name; everything else may be left out (stored as empty). */
export type NewSupplier = Partial<SupplierFields> & { name: string };
export type NewContact = Partial<ContactFields> & { name: string };

/** A row of the suppliers list. */
export type SupplierSummary = {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  contactCount: number;
  productCount: number;
};

export type ProductRef = { id: string; code: string; nameEn: string; published: boolean; imageUrl: string | null };

export type OfferFields = {
  supplierModel: string;
  price: Money | null;
  catalogPage: number | null;
};

/** "This supplier makes this product", seen from the supplier. */
export type SupplierOffer = OfferFields & { id: string; product: ProductRef };

/** "This supplier makes this product", seen from the product. */
export type ProductOffer = OfferFields & { id: string; supplier: { id: string; name: string } };

export type SupplierDetail = SupplierFields & {
  id: string;
  contacts: Contact[];
  offers: SupplierOffer[];
};

/** A product with every supplier that makes it: the answer to "who supplies GS-FRY-0001, at what price?". */
export type ProductSourcing = ProductRef & { offers: ProductOffer[] };
