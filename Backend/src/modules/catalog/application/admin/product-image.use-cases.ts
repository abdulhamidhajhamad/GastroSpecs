import { Injectable, NotFoundException } from "@nestjs/common";
import { orNotFound } from "@/shared/http/or-not-found";
import { toStorableImage, type UploadedFile } from "@/shared/storage/image-file";
import { ObjectStorage } from "@/shared/storage/object-storage";
import { discardQuietly, storeThenSave } from "@/shared/storage/store-image";
import { CatalogMediaRepository } from "../../domain/catalog-media.repository";

/** Adds a photo to a product (stored under products/<productId>/), after its existing photos. */
@Injectable()
export class AddProductImageUseCase {
  constructor(
    private readonly media: CatalogMediaRepository,
    private readonly storage: ObjectStorage,
  ) {}

  async execute(productId: string, file: UploadedFile | undefined) {
    const image = toStorableImage(file, `products/${productId}`);
    if (!(await this.media.productExists(productId))) throw new NotFoundException("Product not found");

    const saved = await storeThenSave(this.storage, image, () => this.media.addProductImage(productId, image.key));
    return { id: saved.id, url: this.storage.publicUrl(saved.key) };
  }
}

/** Removes one photo from a product and deletes the file. */
@Injectable()
export class RemoveProductImageUseCase {
  constructor(
    private readonly media: CatalogMediaRepository,
    private readonly storage: ObjectStorage,
  ) {}

  async execute(productId: string, imageId: string): Promise<void> {
    const key = orNotFound(await this.media.removeProductImage(productId, imageId), "Image");
    await discardQuietly(this.storage, key);
  }
}
