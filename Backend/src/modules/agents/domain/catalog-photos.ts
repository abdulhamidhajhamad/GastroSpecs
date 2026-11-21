/** Where a product's photo is on a catalog page, as fractions of the page (0,0 = top-left, 1,1 = bottom-right). */
export type PhotoBox = { left: number; top: number; right: number; bottom: number };

export type CroppedPhoto = {
  /** JPEG on a white square, ready to be a product photo. */
  image: Buffer;
  /** Things the admin should check (dark background, low resolution…). */
  warnings: string[];
};

/** An opened catalog. Crop products page by page: the last decoded page is kept for the next crop. */
export interface CatalogPhotoReader {
  /** `page` is 1-based; `maxSize` is the longest side of the result in pixels. Throws a readable Error. */
  crop(page: number, box: PhotoBox, maxSize?: number): Promise<CroppedPhoto>;
}

/** Port: cuts product photos out of a catalog file. The abstract class doubles as the DI token. */
export abstract class CatalogPhotos {
  abstract open(catalog: Buffer): Promise<CatalogPhotoReader>;
}
