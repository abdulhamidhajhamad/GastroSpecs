import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@/shared/prisma/prisma.service";
import { ObjectStorage } from "@/shared/storage/object-storage";
import { CatalogRepository } from "../domain/catalog.repository";
import type { BusinessType, BusinessTypeWithCategories, CategoryNode, CategoryRef, Product } from "../domain/catalog.types";
import { catalogMapper, productCardInclude, productInclude } from "./catalog.mapper";

const bySortOrder = { sortOrder: "asc" } as const;
const withChildren = { children: { orderBy: bySortOrder } } as const satisfies Prisma.CategoryInclude;
type CategoryWithChildren = Prisma.CategoryGetPayload<{ include: typeof withChildren }>;

@Injectable()
export class PrismaCatalogRepository implements CatalogRepository {
  private readonly map: ReturnType<typeof catalogMapper>;

  constructor(
    private readonly prisma: PrismaService,
    storage: ObjectStorage,
  ) {
    this.map = catalogMapper((key) => storage.publicUrl(key));
  }

  private readonly toNode = (row: CategoryWithChildren): CategoryNode => ({
    ...this.map.toCategoryRef(row),
    children: row.children.map(this.map.toCategoryRef),
  });

  async listCategoryTree(): Promise<CategoryNode[]> {
    const rows = await this.prisma.category.findMany({ where: { parentId: null }, orderBy: bySortOrder, include: withChildren });
    return rows.map(this.toNode);
  }

  async findCategory(slug: string): Promise<CategoryNode | null> {
    const row = await this.prisma.category.findUnique({ where: { slug }, include: withChildren });
    return row && this.toNode(row);
  }

  async listBusinessTypeCategories(slug: string): Promise<CategoryRef[]> {
    const rows = await this.prisma.category.findMany({
      where: { businessTypes: { some: { businessType: { slug } } } },
      orderBy: bySortOrder,
    });
    return rows.map(this.map.toCategoryRef);
  }

  async listBusinessTypes(): Promise<BusinessTypeWithCategories[]> {
    const rows = await this.prisma.businessType.findMany({
      orderBy: bySortOrder,
      include: { categories: { include: { category: true }, orderBy: { category: bySortOrder } } },
    });
    return rows.map((row) => ({
      ...this.map.toBusinessType(row),
      categories: row.categories.map((link) => this.map.toCategoryRef(link.category)),
    }));
  }

  async findBusinessType(slug: string): Promise<BusinessType | null> {
    const row = await this.prisma.businessType.findUnique({ where: { slug } });
    return row && this.map.toBusinessType(row);
  }

  async listProductsByCategory(slug: string): Promise<Product[]> {
    // Categories are two levels deep, so "the category or its parent" covers both cases without recursion.
    const rows = await this.prisma.product.findMany({
      where: { published: true, category: { OR: [{ slug }, { parent: { slug } }] } },
      // Biggest, most powerful machines first; the name only breaks ties.
      orderBy: [{ displayRank: "desc" }, { nameEn: "asc" }],
      include: productCardInclude,
    });
    return rows.map(this.map.toProduct);
  }

  async findProduct(slug: string): Promise<Product | null> {
    const row = await this.prisma.product.findFirst({ where: { slug, published: true }, include: productInclude });
    return row && this.map.toProduct(row);
  }

  listProductSlugs() {
    return this.prisma.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true }, orderBy: { code: "asc" } });
  }
}
