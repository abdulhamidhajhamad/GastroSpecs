import { Injectable } from "@nestjs/common";
import { orNotFound } from "@/shared/http/or-not-found";
import { CatalogRepository } from "../domain/catalog.repository";

/** A venue's page: the equipment categories it needs (e.g. Fried chicken → Pressure fryers, Breading tables…). */
@Injectable()
export class GetBusinessTypeCatalogUseCase {
  constructor(private readonly catalog: CatalogRepository) {}

  async execute(slug: string) {
    const [businessType, categories] = await Promise.all([
      this.catalog.findBusinessType(slug),
      this.catalog.listBusinessTypeCategories(slug),
    ]);

    return { businessType: orNotFound(businessType, "Business type"), categories };
  }
}
