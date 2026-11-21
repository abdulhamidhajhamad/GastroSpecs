import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ObjectStorage } from "./object-storage";

/**
 * Browsers keep a file for a year: every key contains a random id, so a URL never changes content.
 * Cloudflare's edge keeps it one day (s-maxage), so a deleted file stops being served within a day.
 */
const IMMUTABLE_CACHE = "public, max-age=31536000, s-maxage=86400, immutable";

/** Cloudflare R2 through its S3-compatible API. Fails at startup if any R2_* variable is missing. */
@Injectable()
export class R2ObjectStorage implements ObjectStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(config: ConfigService) {
    this.bucket = config.getOrThrow<string>("R2_BUCKET");
    this.publicBaseUrl = config.getOrThrow<string>("R2_PUBLIC_URL").replace(/\/$/, "");
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.getOrThrow<string>("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.getOrThrow<string>("R2_ACCESS_KEY_ID"),
        secretAccessKey: config.getOrThrow<string>("R2_SECRET_ACCESS_KEY"),
      },
    });
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType, CacheControl: IMMUTABLE_CACHE }),
    );
  }

  async get(key: string): Promise<Buffer> {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    if (!result.Body) throw new Error(`Empty object: ${key}`);
    return Buffer.from(await result.Body.transformToByteArray());
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  publicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }
}
