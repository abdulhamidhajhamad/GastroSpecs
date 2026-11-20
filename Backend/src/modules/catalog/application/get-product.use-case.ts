import { Injectable } from "@nestjs/common";
import { orNotFound } from "@/shared/http/or-not-found";
import { CatalogRepository } from "../domain/catalog.repository";

@Injectable()
export class GetProductUseCase {
  constructor(private readonly catalog: CatalogRepository) {}

  async execute(slug: string) {
    return orNotFound(await this.catalog.findProduct(slug), "Product");
  }
}
