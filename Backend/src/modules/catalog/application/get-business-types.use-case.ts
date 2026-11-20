import { Injectable } from "@nestjs/common";
import { CatalogRepository } from "../domain/catalog.repository";

/** All business types: the "by venue" entry cards. */
@Injectable()
export class GetBusinessTypesUseCase {
  constructor(private readonly catalog: CatalogRepository) {}

  execute() {
    return this.catalog.listBusinessTypes();
  }
}
