/**
 * Provider Vercel Blob.
 */
import { UploadError } from "../errors";
import type { IUploadProvider, UploadOptions, UploadResult, UploadSource } from "../types";

export interface VercelBlobConfig {
  token?: string;
  uploadEndpoint?: string;
}

export class VercelBlobProvider implements IUploadProvider {
  readonly name = "vercel-blob";
  private readonly token?: string;
  private readonly uploadEndpoint?: string;

  constructor(config: VercelBlobConfig) {
    this.token = config.token;
    this.uploadEndpoint = config.uploadEndpoint;
  }

  async upload(source: UploadSource, options?: UploadOptions): Promise<UploadResult> {
    const fileName = `${options?.folder ? `${options.folder}/` : ""}${Date.now()}_${source.name}`;

    // Proxy endpoint (recommandé pour client-side)
    if (this.uploadEndpoint) {
      const formData = new FormData();
      if (source.file) {
        formData.append("file", source.file);
      } else if (source.uri) {
        formData.append("file", {
          uri: source.uri,
          name: source.name,
          type: source.type || "application/octet-stream",
        } as unknown as Blob);
      }
      formData.append("pathname", fileName);

      const res = await fetch(this.uploadEndpoint, { method: "POST", body: formData });
      if (!res.ok) throw new UploadError(`Upload Vercel Blob proxy failed (${res.status})`);
      const blobData = await res.json();
      return {
        success: true,
        url: blobData.url,
        publicId: blobData.pathname || fileName,
        bytes: blobData.size,
      };
    }

    if (!this.token) throw new UploadError("Vercel Blob token ou uploadEndpoint requis.");

    const response = await fetch(`https://blob.vercel-storage.com/${fileName}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${this.token}`,
        "x-add-random-suffix": "true",
      },
      body: (source.file ||
        (source.uri
          ? ({ uri: source.uri } as any)
          : source.base64)) as any,
    });
    if (!response.ok) throw new UploadError(`Vercel Blob direct upload failed (${response.status})`);
    const json = await response.json();
    return {
      success: true,
      url: json.url,
      publicId: json.pathname,
      bytes: json.size,
    };
  }
}
