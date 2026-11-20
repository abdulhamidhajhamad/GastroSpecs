import { Injectable } from "@nestjs/common";
import { orNotFound } from "@/shared/http/or-not-found";
import { CatalogRepository } from "../domain/catalog.repository";
import { groupByCategory } from "../domain/group-by-category";

/**
 * An equipment page. A main category (Preparation) comes with its subcategories and one product group
 * per subcategory; a subcategory (Mixers) has no children and a single group.
 */
@Injectable()
export class GetCategoryCatalogUseCase {
  constructor(private readonly catalog: CatalogRepository) {}

  async execute(slug: string) {
    const [category, products] = await Promise.all([
      this.catalog.findCategory(slug),
      this.catalog.listProductsByCategory(slug),
    ]);

    return {
      category: orNotFound(category, "Category"),
      groups: groupByCategory(products),
    };
  }
}
