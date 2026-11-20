import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/shared/prisma/prisma.service";
import { CatalogMediaRepository } from "../domain/catalog-media.repository";

@Injectable()
export class PrismaCatalogMediaRepository implements CatalogMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCategoryImage(categoryId: string) {
    return this.prisma.category.findUnique({ where: { id: categoryId }, select: { imageKey: true } });
  }

  async setCategoryImage(categoryId: string, imageKey: string | null): Promise<void> {
    await this.prisma.category.update({ where: { id: categoryId }, data: { imageKey } });
  }

  async productExists(productId: string): Promise<boolean> {
    return (await this.prisma.product.count({ where: { id: productId } })) > 0;
  }

  async addProductImage(productId: string, key: string) {
    const last = await this.prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    return this.prisma.productImage.create({
      data: { productId, key, sortOrder: (last?.sortOrder ?? -1) + 1 },
      select: { id: true, key: true },
    });
  }

  async removeProductImage(productId: string, imageId: string): Promise<string | null> {
    const image = await this.prisma.productImage.findFirst({ where: { id: imageId, productId }, select: { key: true } });
    if (!image) return null;
    await this.prisma.productImage.delete({ where: { id: imageId } });
    return image.key;
  }
}
