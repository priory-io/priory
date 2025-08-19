import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { promises as fs } from "fs";
import path from "path";
import { config } from "./config";

export interface StorageProvider {
  uploadFile(key: string, buffer: Uint8Array, mimeType: string): Promise<void>;
  deleteFile(key: string): Promise<void>;
  getFileUrl(key: string): string;
}

class R2StorageProvider implements StorageProvider {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.r2.accessKeyId!,
        secretAccessKey: config.r2.secretAccessKey!,
      },
    });
  }

  async uploadFile(
    key: string,
    buffer: Uint8Array,
    mimeType: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: config.r2.bucketName!,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await this.client.send(command);
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: config.r2.bucketName!,
      Key: key,
    });

    await this.client.send(command);
  }

  getFileUrl(key: string): string {
    return `${config.r2.publicUrl}/${key}`;
  }
}

class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = config.localStorage.basePath;
  }

  async uploadFile(
    key: string,
    buffer: Uint8Array,
    _mimeType: string,
  ): Promise<void> {
    const filePath = path.join(this.basePath, key);
    const directory = path.dirname(filePath);

    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(filePath, buffer);
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.basePath, key);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  getFileUrl(key: string): string {
    return `${config.localStorage.uploadsPath}/${key}`;
  }
}

export function createStorageProvider(): StorageProvider {
  return config.storage.type === "local"
    ? new LocalStorageProvider()
    : new R2StorageProvider();
}
