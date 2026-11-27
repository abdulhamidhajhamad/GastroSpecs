import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@/shared/prisma/prisma.service";
import { ObjectStorage } from "@/shared/storage/object-storage";
import { CatalogRepository } from "../domain/catalog.repository";
import type { BusinessType, BusinessTypeWithCategories, CategoryNode, CategoryRef, Product } from "../domain/catalog.types";
import { catalogMapper, productCardInclude, productInclude } from "./catalog.mapper";

const bySortOrder = { sortOrder: "asc" } as const;
/** A venue's equipment in the venue's own order; ties (links without a position) follow the catalog order. */
const venueOrder = [{ sortOrder: "asc" }, { category: bySortOrder }] as const satisfies Prisma.BusinessTypeCategoryOrderByWithRelationInput[];
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
    const links = await this.prisma.businessTypeCategory.findMany({
      where: { businessType: { slug } },
      orderBy: venueOrder,
      include: { category: true },
    });
    return links.map((link) => this.map.toCategoryRef(link.category));
  }

  async listBusinessTypes(): Promise<BusinessTypeWithCategories[]> {
    const rows = await this.prisma.businessType.findMany({
      orderBy: bySortOrder,
      include: { categories: { include: { category: true }, orderBy: venueOrder } },
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
    const inTree = { OR: [{ slug }, { parent: { slug } }] } satisfies Prisma.CategoryWhereInput;
    const rows = await this.prisma.product.findMany({
      // Its own category, or a category that also lists it.
      where: { published: true, OR: [{ category: inTree }, { extraCategories: { some: { category: inTree } } }] },
      // Biggest, most powerful machines first; the name only breaks ties.
      orderBy: [{ displayRank: "desc" }, { nameEn: "asc" }],
      include: { ...productCardInclude, extraCategories: { where: { category: inTree }, include: { category: true } } },
    });
    // A product listed here through an extra category is shown in that category's group.
    const ownHere = new Set((await this.prisma.category.findMany({ where: inTree, select: { id: true } })).map((c) => c.id));
    return rows.map((row) => {
      const product = this.map.toProduct(row);
      const extra = row.extraCategories[0]?.category;
      return ownHere.has(row.categoryId) || !extra ? product : { ...product, category: this.map.toCategoryRef(extra) };
    });
  }

  async findProduct(slug: string): Promise<Product | null> {
    const row = await this.prisma.product.findFirst({ where: { slug, published: true }, include: productInclude });
    return row && this.map.toProduct(row);
  }

  listProductSlugs() {
    return this.prisma.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true }, orderBy: { code: "asc" } });
  }
}
