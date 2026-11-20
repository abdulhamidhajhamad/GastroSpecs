import { Logger } from "@nestjs/common";
import type { StorableImage } from "./image-file";
import { ObjectStorage } from "./object-storage";

const logger = new Logger("Storage");

/** Deletes a file without failing the request: a leftover file costs a few KB, a failed save costs the admin's work. */
export async function discardQuietly(storage: ObjectStorage, key: string | null): Promise<void> {
  if (!key) return;
  try {
    await storage.delete(key);
  } catch (error) {
    logger.warn(`Could not delete ${key}: ${String(error)}`);
  }
}

/**
 * Uploads the image, then runs `save` to record its key in the database.
 * If saving fails the uploaded file is removed again, so storage never fills with files nothing points to.
 */
export async function storeThenSave<T>(storage: ObjectStorage, image: StorableImage, save: () => Promise<T>): Promise<T> {
  await storage.put(image.key, image.body, image.contentType);
  try {
    return await save();
  } catch (error) {
    await discardQuietly(storage, image.key);
    throw error;
  }
}
