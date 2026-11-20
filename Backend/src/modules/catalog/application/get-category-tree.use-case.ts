import { Injectable } from "@nestjs/common";
import { CatalogRepository } from "../domain/catalog.repository";

/** Main categories with their subcategories: the "by equipment" menu. */
@Injectable()
export class GetCategoryTreeUseCase {
  constructor(private readonly catalog: CatalogRepository) {}

  execute() {
    return this.catalog.listCategoryTree();
  }
}
