/**
 * Provider Local / API REST custom (ex: /api/upload Nest, Express, etc.).
 */
import { UploadError } from "../errors";
import type { IUploadProvider, UploadOptions, UploadResult, UploadSource } from "../types";

export interface LocalUploadConfig {
  endpoint: string;
  headers?: Record<string, string>;
  fieldName?: string;
}

export class LocalUploadProvider implements IUploadProvider {
  readonly name = "local";
  private readonly endpoint: string;
  private readonly headers: Record<string, string>;
  private readonly fieldName: string;

  constructor(config: LocalUploadConfig) {
    this.endpoint = config.endpoint;
    this.headers = config.headers || {};
    this.fieldName = config.fieldName || "file";
  }

  async upload(source: UploadSource, options?: UploadOptions): Promise<UploadResult> {
    const formData = new FormData();
    if (source.file) {
      formData.append(this.fieldName, source.file);
    } else if (source.uri) {
      formData.append(this.fieldName, {
        uri: source.uri,
        name: source.name,
        type: source.type || "application/octet-stream",
      } as unknown as Blob);
    } else if (source.base64) {
      formData.append(this.fieldName, source.base64);
    } else {
      throw new UploadError("Aucune source valide pour LocalUploadProvider.");
    }

    if (options?.folder) formData.append("folder", options.folder);

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: this.headers,
      body: formData,
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new UploadError(`Upload Local/API failed (${response.status}): ${errText}`);
    }
    const data = await response.json() as {
      url?: string;
      path?: string;
      secureUrl?: string;
      id?: string;
      publicId?: string;
      filename?: string;
      size?: number;
      bytes?: number;
    };
    return {
      success: true,
      url: data.url || data.path || data.secureUrl || "",
      publicId: data.id || data.publicId || data.filename,
      bytes: data.size || data.bytes,
    };
  }

  async delete(publicId: string): Promise<boolean> {
    const response = await fetch(`${this.endpoint}/${encodeURIComponent(publicId)}`, {
      method: "DELETE",
      headers: this.headers,
    });
    return response.ok;
  }
}
