/**
 * Port for file storage. Slices store and pass around object *keys*; only `publicUrl`
 * turns a key into something a browser can load. The abstract class doubles as the DI token.
 */
export abstract class ObjectStorage {
  abstract put(key: string, body: Buffer, contentType: string): Promise<void>;
  /** The stored bytes, e.g. a catalog PDF an agent works on. */
  abstract get(key: string): Promise<Buffer>;
  abstract delete(key: string): Promise<void>;
  abstract publicUrl(key: string): string;
}
