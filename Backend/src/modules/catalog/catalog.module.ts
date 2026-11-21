import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { RemoveCategoryImageUseCase, ReplaceCategoryImageUseCase } from "./application/admin/category-image.use-cases";
import { ProductAdminUseCases } from "./application/admin/product-admin.use-cases";
import { AddProductImageUseCase, RemoveProductImageUseCase } from "./application/admin/product-image.use-cases";
import { GetBusinessTypeCatalogUseCase } from "./application/get-business-type-catalog.use-case";
import { GetBusinessTypesUseCase } from "./application/get-business-types.use-case";
import { GetCategoryCatalogUseCase } from "./application/get-category-catalog.use-case";
import { GetCategoryTreeUseCase } from "./application/get-category-tree.use-case";
import { GetProductUseCase, ListProductSlugsUseCase } from "./application/get-product.use-case";
import { CatalogMediaRepository } from "./domain/catalog-media.repository";
import { CatalogRepository } from "./domain/catalog.repository";
import { ProductAdminRepository } from "./domain/product-admin.repository";
import { PrismaCatalogMediaRepository } from "./infrastructure/prisma-catalog-media.repository";
import { PrismaCatalogRepository } from "./infrastructure/prisma-catalog.repository";
import { PrismaProductAdminRepository } from "./infrastructure/prisma-product-admin.repository";
import { CatalogAdminController } from "./presentation/catalog-admin.controller";
import { CatalogController } from "./presentation/catalog.controller";

@Module({
  imports: [AuthModule],
  controllers: [CatalogController, CatalogAdminController],
  providers: [
    GetCategoryTreeUseCase,
    GetCategoryCatalogUseCase,
    GetBusinessTypesUseCase,
    GetBusinessTypeCatalogUseCase,
    GetProductUseCase,
    ListProductSlugsUseCase,
    ReplaceCategoryImageUseCase,
    RemoveCategoryImageUseCase,
    AddProductImageUseCase,
    RemoveProductImageUseCase,
    ProductAdminUseCases,
    // The only lines that tie the catalog to Prisma.
    { provide: CatalogRepository, useClass: PrismaCatalogRepository },
    { provide: CatalogMediaRepository, useClass: PrismaCatalogMediaRepository },
    { provide: ProductAdminRepository, useClass: PrismaProductAdminRepository },
  ],
  // For the agents slice, which works through these use cases like an admin does.
  exports: [GetCategoryTreeUseCase, ProductAdminUseCases, AddProductImageUseCase],
})
export class CatalogModule {}
