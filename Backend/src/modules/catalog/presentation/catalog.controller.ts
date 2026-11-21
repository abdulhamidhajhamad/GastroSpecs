import { Controller, Get, Param, Query } from "@nestjs/common";
import { LocaleQueryDto } from "@/shared/http/locale-query.dto";
import { GetBusinessTypeCatalogUseCase } from "../application/get-business-type-catalog.use-case";
import { GetBusinessTypesUseCase } from "../application/get-business-types.use-case";
import { GetCategoryCatalogUseCase } from "../application/get-category-catalog.use-case";
import { GetCategoryTreeUseCase } from "../application/get-category-tree.use-case";
import { GetProductUseCase, ListProductSlugsUseCase } from "../application/get-product.use-case";
import { catalogPresenter } from "./catalog.presenter";

/** Public, read-only catalog API. Every route takes `?locale=en|ar`. */
@Controller("catalog")
export class CatalogController {
  constructor(
    private readonly getCategoryTree: GetCategoryTreeUseCase,
    private readonly getCategoryCatalog: GetCategoryCatalogUseCase,
    private readonly getBusinessTypes: GetBusinessTypesUseCase,
    private readonly getBusinessTypeCatalog: GetBusinessTypeCatalogUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly listProductSlugs: ListProductSlugsUseCase,
  ) {}

  @Get("categories")
  async categories(@Query() { locale }: LocaleQueryDto) {
    return (await this.getCategoryTree.execute()).map(catalogPresenter(locale).categoryNode);
  }

  @Get("categories/:slug")
  async category(@Param("slug") slug: string, @Query() { locale }: LocaleQueryDto) {
    const present = catalogPresenter(locale);
    const { category, groups } = await this.getCategoryCatalog.execute(slug);
    return { category: present.categoryNode(category), groups: present.groups(groups) };
  }

  @Get("business-types")
  async businessTypes(@Query() { locale }: LocaleQueryDto) {
    return (await this.getBusinessTypes.execute()).map(catalogPresenter(locale).businessTypeWithCategories);
  }

  @Get("business-types/:slug")
  async businessType(@Param("slug") slug: string, @Query() { locale }: LocaleQueryDto) {
    const present = catalogPresenter(locale);
    const { businessType, categories } = await this.getBusinessTypeCatalog.execute(slug);
    return { businessType: present.businessType(businessType), categories: categories.map(present.category) };
  }

  /** Every published product's slug, for the sitemap. */
  @Get("products")
  productSlugs() {
    return this.listProductSlugs.execute();
  }

  @Get("products/:slug")
  async product(@Param("slug") slug: string, @Query() { locale }: LocaleQueryDto) {
    return catalogPresenter(locale).product(await this.getProduct.execute(slug));
  }
}
