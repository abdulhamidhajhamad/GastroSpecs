import { BadRequestException, Injectable } from "@nestjs/common";
import { SourcingRepository } from "../domain/sourcing.repository";
import type { Money } from "../domain/sourcing.types";
import type { CreateOfferDto, UpdateOfferDto } from "./dto/sourcing.dto";

/** Most products a search returns: enough for the dashboard, small enough to stay one fast query. */
const SEARCH_LIMIT = 30;

/**
 * Reads the price out of a request: undefined = leave it, null = clear it.
 * Amount and currency only make sense together.
 */
function priceFrom({ priceAmount, priceCurrency }: { priceAmount?: number | null; priceCurrency?: string | null }) {
  if (priceAmount === undefined && priceCurrency === undefined) return undefined;
  if (priceAmount == null && priceCurrency == null) return null;
  if (priceAmount == null || priceCurrency == null) {
    throw new BadRequestException("priceAmount and priceCurrency must be sent together");
  }
  return { amount: priceAmount, currency: priceCurrency } satisfies Money;
}

/** Which supplier makes which product, under what model code and at what price. */
@Injectable()
export class OfferUseCases {
  constructor(private readonly sourcing: SourcingRepository) {}

  /** The dashboard's product search: a code, a name or a supplier's model → the products with all their suppliers. */
  search(query?: string) {
    return this.sourcing.findProductSourcing(query, SEARCH_LIMIT);
  }

  listForProduct(productId: string) {
    return this.sourcing.listProductOffers(productId);
  }

  add(input: CreateOfferDto) {
    return this.sourcing.addOffer(input.supplierId, input.productId, {
      supplierModel: input.supplierModel,
      price: priceFrom(input) ?? null,
      catalogPage: input.catalogPage ?? null,
    });
  }

  update(id: string, input: UpdateOfferDto) {
    return this.sourcing.updateOffer(id, {
      supplierModel: input.supplierModel,
      price: priceFrom(input),
      catalogPage: input.catalogPage,
    });
  }

  delete(id: string) {
    return this.sourcing.deleteOffer(id);
  }
}
