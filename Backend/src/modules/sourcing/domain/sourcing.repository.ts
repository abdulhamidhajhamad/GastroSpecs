import type {
  Contact,
  ContactFields,
  NewContact,
  NewSupplier,
  OfferFields,
  ProductOffer,
  ProductSourcing,
  SupplierDetail,
  SupplierFields,
  SupplierSummary,
} from "./sourcing.types";

/**
 * Port for suppliers, their contacts and their offers. The abstract class doubles as the DI token.
 * Writes answer 404 when the target row is missing and 409 on duplicates.
 */
export abstract class SourcingRepository {
  /** Name contains `search` (any case); all suppliers when empty. Alphabetical. */
  abstract listSuppliers(search: string | undefined): Promise<SupplierSummary[]>;
  abstract findSupplier(id: string): Promise<SupplierDetail | null>;
  /** The supplier stored under this normalized name, if any (see normalizeSupplierName). */
  abstract findSupplierIdByKey(normalizedName: string): Promise<string | null>;
  abstract createSupplier(fields: NewSupplier, normalizedName: string): Promise<{ id: string }>;
  abstract updateSupplier(id: string, fields: Partial<SupplierFields>, normalizedName?: string): Promise<void>;
  /** Also removes its contacts and offers; the products themselves stay. */
  abstract deleteSupplier(id: string): Promise<void>;

  abstract addContact(supplierId: string, fields: NewContact): Promise<Contact>;
  abstract updateContact(id: string, fields: Partial<ContactFields>): Promise<void>;
  abstract deleteContact(id: string): Promise<void>;

  /**
   * Products whose code, name or any supplier model contains `search`, each with all its offers.
   * Newest products first when `search` is empty. At most `limit` products.
   */
  abstract findProductSourcing(search: string | undefined, limit: number): Promise<ProductSourcing[]>;
  abstract listProductOffers(productId: string): Promise<ProductOffer[]>;
  abstract addOffer(supplierId: string, productId: string, fields: OfferFields): Promise<{ id: string }>;
  abstract updateOffer(id: string, fields: Partial<OfferFields>): Promise<void>;
  abstract deleteOffer(id: string): Promise<void>;
}
