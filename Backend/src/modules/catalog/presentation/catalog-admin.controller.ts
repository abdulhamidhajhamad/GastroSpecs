import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "@/modules/auth/presentation/jwt-auth.guard";
import { MAX_IMAGE_BYTES } from "@/shared/storage/image-file";
import { CreateProductDto, UpdateProductDto } from "../application/admin/dto/product.dto";
import { ProductAdminUseCases } from "../application/admin/product-admin.use-cases";
import { ReplaceCategoryImageUseCase, RemoveCategoryImageUseCase } from "../application/admin/category-image.use-cases";
import { AddProductImageUseCase, RemoveProductImageUseCase } from "../application/admin/product-image.use-cases";
import { GetCategoryTreeUseCase } from "../application/get-category-tree.use-case";
import type { CategoryRef } from "../domain/catalog.types";

/** Reads the upload into memory (field "file"); multer itself rejects anything over the size limit. */
const ImageUpload = () => UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } }));

const adminCategory = (c: CategoryRef) => ({ id: c.id, slug: c.slug, nameEn: c.name.en, nameAr: c.name.ar, imageUrl: c.imageUrl });

/** Dashboard API for products and catalog images. Every route requires a signed-in admin. */
@Controller("admin/catalog")
@UseGuards(JwtAuthGuard)
export class CatalogAdminController {
  constructor(
    private readonly getCategoryTree: GetCategoryTreeUseCase,
    private readonly replaceCategoryImage: ReplaceCategoryImageUseCase,
    private readonly removeCategoryImage: RemoveCategoryImageUseCase,
    private readonly addProductImage: AddProductImageUseCase,
    private readonly removeProductImage: RemoveProductImageUseCase,
    private readonly products: ProductAdminUseCases,
  ) {}

  /** Both languages at once, since the admin edits both. */
  @Get("categories")
  async categories() {
    return (await this.getCategoryTree.execute()).map((c) => ({ ...adminCategory(c), children: c.children.map(adminCategory) }));
  }

  @Put("categories/:id/image")
  @ImageUpload()
  setCategoryImage(@Param("id", ParseUUIDPipe) id: string, @UploadedFile() file?: Express.Multer.File) {
    return this.replaceCategoryImage.execute(id, file);
  }

  @Delete("categories/:id/image")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCategoryImage(@Param("id", ParseUUIDPipe) id: string) {
    return this.removeCategoryImage.execute(id);
  }

  /** Every field in both languages, including unpublished products. */
  @Get("products/:id")
  getProduct(@Param("id", ParseUUIDPipe) id: string) {
    return this.products.get(id);
  }

  /** Answers the new product's id, code ("GS-FRY-0001") and slug. Starts unpublished unless `published` is sent. */
  @Post("products")
  createProduct(@Body() body: CreateProductDto) {
    return this.products.create(body);
  }

  @Patch("products/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  updateProduct(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateProductDto) {
    return this.products.update(id, body);
  }

  /** Also deletes its photos and its supplier links. */
  @Delete("products/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProduct(@Param("id", ParseUUIDPipe) id: string) {
    return this.products.delete(id);
  }

  @Post("products/:id/images")
  @ImageUpload()
  addImage(@Param("id", ParseUUIDPipe) id: string, @UploadedFile() file?: Express.Multer.File) {
    return this.addProductImage.execute(id, file);
  }

  @Delete("products/:id/images/:imageId")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteImage(@Param("id", ParseUUIDPipe) id: string, @Param("imageId", ParseUUIDPipe) imageId: string) {
    return this.removeProductImage.execute(id, imageId);
  }
}
