import { BadRequestException } from "@nestjs/common";
import { randomUUID } from "node:crypto";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type ImageType = { ext: string; contentType: string };

/**
 * Identifies an image by its first bytes. The browser-sent MIME type is ignored because
 * anyone can fake it; the file's own signature cannot be renamed away.
 */
function detectImageType(bytes: Buffer): ImageType | null {
  const ascii = (start: number, end: number) => bytes.subarray(start, end).toString("ascii");

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { ext: "jpg", contentType: "image/jpeg" };
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: "png", contentType: "image/png" };
  }
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { ext: "webp", contentType: "image/webp" };
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return { ext: "avif", contentType: "image/avif" };
  return null;
}

/** The parts of an upload we need. Kept framework-free so use cases don't depend on multer. */
export type UploadedFile = { buffer: Buffer; size: number };

export type StorableImage = { key: string; body: Buffer; contentType: string };

/**
 * Validates an uploaded image and gives it a key under `folder`, e.g. "products/<productId>/<uuid>.webp".
 * The random file name means a replaced image never reuses a URL, so browsers and CDNs can cache forever.
 */
export function toStorableImage(file: UploadedFile | undefined, folder: string): StorableImage {
  if (!file) throw new BadRequestException("An image file is required (form field \"file\")");
  if (file.size > MAX_IMAGE_BYTES) throw new BadRequestException("Image must be 10 MB or smaller");

  const type = detectImageType(file.buffer);
  if (!type) throw new BadRequestException("Only JPEG, PNG, WebP or AVIF images are accepted");

  return { key: `${folder}/${randomUUID()}.${type.ext}`, body: file.buffer, contentType: type.contentType };
}
