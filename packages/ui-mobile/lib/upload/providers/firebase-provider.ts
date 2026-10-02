/**
 * Provider Firebase Storage (REST, Web + RN).
 */
import { UploadError } from "../errors";
import type { IUploadProvider, UploadOptions, UploadResult, UploadSource } from "../types";

export interface FirebaseStorageConfig {
  bucket: string;
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
}

export class FirebaseStorageProvider implements IUploadProvider {
  readonly name = "firebase";
  private readonly bucket: string;

  constructor(config: FirebaseStorageConfig) {
    this.bucket = config.bucket.replace(/^gs:\/\//, "");
  }

  async upload(source: UploadSource, options?: UploadOptions): Promise<UploadResult> {
    const folder = options?.folder ? `${options.folder.replace(/^\/|\/$/g, "")}/` : "";
    const cleanFileName = source.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectPath = encodeURIComponent(`${folder}${Date.now()}_${cleanFileName}`);
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucket}/o?uploadType=media&name=${objectPath}`;

    let bodyData: unknown;
    const headers: Record<string, string> = {
      "Content-Type": source.type || "application/octet-stream",
    };

    if (source.file) {
      bodyData = source.file;
    } else if (source.uri) {
      const formData = new FormData();
      formData.append("file", {
        uri: source.uri,
        name: cleanFileName,
        type: source.type || "image/jpeg",
      } as unknown as Blob);
      bodyData = formData;
    } else if (source.base64) {
      bodyData = source.base64;
    } else {
      throw new UploadError("Aucune source valide fournie pour l'upload Firebase.");
    }

    const response = await fetch(uploadUrl, { method: "POST", headers, body: bodyData as BodyInit_ });
    if (!response.ok) {
      const errorText = await response.text();
      throw new UploadError(
        `Échec de l'upload Firebase Storage (${response.status}): ${errorText}`,
      );
    }

    const data = await response.json();
    const downloadToken: string | undefined = data.downloadTokens;
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucket}/o/${objectPath}?alt=media${
      downloadToken ? `&token=${downloadToken}` : ""
    }`;

    return {
      success: true,
      url: publicUrl,
      publicId: data.name,
      format: source.type.split("/")[1] || undefined,
      bytes: data.size ? parseInt(data.size as string, 10) : undefined,
    };
  }

  async delete(publicId: string): Promise<boolean> {
    const encodedPath = encodeURIComponent(publicId);
    const deleteUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucket}/o/${encodedPath}`;
    const response = await fetch(deleteUrl, { method: "DELETE" });
    return response.ok;
  }
}
