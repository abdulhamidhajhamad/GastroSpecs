import { Injectable } from "@nestjs/common";
import { orNotFound } from "@/shared/http/or-not-found";
import { toStorableImage, type UploadedFile } from "@/shared/storage/image-file";
import { ObjectStorage } from "@/shared/storage/object-storage";
import { discardQuietly, storeThenSave } from "@/shared/storage/store-image";
import { CatalogMediaRepository } from "../../domain/catalog-media.repository";

/** Sets or replaces a category's image (stored under categories/<categoryId>/). The old file is deleted. */
@Injectable()
export class ReplaceCategoryImageUseCase {
  constructor(
    private readonly media: CatalogMediaRepository,
    private readonly storage: ObjectStorage,
  ) {}

  async execute(categoryId: string, file: UploadedFile | undefined) {
    const image = toStorableImage(file, `categories/${categoryId}`);
    const current = orNotFound(await this.media.findCategoryImage(categoryId), "Category");

    await storeThenSave(this.storage, image, () => this.media.setCategoryImage(categoryId, image.key));
    await discardQuietly(this.storage, current.imageKey);
    return { imageUrl: this.storage.publicUrl(image.key) };
  }
}

/** Clears a category's image and deletes the file. */
@Injectable()
export class RemoveCategoryImageUseCase {
  constructor(
    private readonly media: CatalogMediaRepository,
    private readonly storage: ObjectStorage,
  ) {}

  async execute(categoryId: string): Promise<void> {
    const current = orNotFound(await this.media.findCategoryImage(categoryId), "Category");
    await this.media.setCategoryImage(categoryId, null);
    await discardQuietly(this.storage, current.imageKey);
  }
}
