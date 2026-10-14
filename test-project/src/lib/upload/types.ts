/**
 * lib/upload/types.ts — Contrats universels upload (Web & Mobile), 1:1 depuis @rashwright/upload v0.1.0.
 */
export interface UploadSource {
  /** Nom du fichier avec extension. */
  name: string;
  /** Taille en octets (optionnel). */
  size?: number;
  /** Type MIME ("image/jpeg", "video/mp4", …). */
  type: string;
  /** Fichier côté Web (File/Blob). */
  file?: Blob | File;
  /** URI locale côté Mobile React Native ("file:///var/…"). */
  uri?: string;
  /** Base64 ou Data URI optionnels. */
  base64?: string;
}

export interface UploadOptions {
  /** Dossier / préfixe distant ("properties/photos"). */
  folder?: string;
  /** Upload preset (Cloudinary upload non signé). */
  preset?: string;
  /** Tags optionnels pour indexation. */
  tags?: string[];
  /** Callback 0→100. */
  onProgress?: (progress: number) => void;
  /** Métadonnées arbitraires. */
  metadata?: Record<string, string>;
}

export interface UploadResult {
  success: boolean;
  /** URL publique finale d'accès HTTPS. */
  url: string;
  /** Identifiant distant (public_id Cloudinary, key S3…). */
  publicId?: string;
  /** Extension/format (jpg, mp4…). */
  format?: string;
  /** Taille finale en octets. */
  bytes?: number;
  /** Dimensions média si dispo. */
  width?: number;
  height?: number;
  /** Original / compressé (pour les uploads avec compression client). */
  originalSize?: number;
  compressedSize?: number;
}

export type UploadStatus = "idle" | "compressing" | "uploading" | "completed" | "error";

export interface UploadTaskState {
  id: string;
  fileName: string;
  status: UploadStatus;
  progress: number;
  result?: UploadResult;
  error?: string;
}

/**
 * Interface que doit implémenter TOUT fournisseur de stockage.
 */
export interface IUploadProvider {
  /** Nom identifiant (cloudinary, firebase, vercel-blob, local, mock). */
  readonly name: string;
  /** Upload 1 fichier. */
  upload(source: UploadSource, options?: UploadOptions): Promise<UploadResult>;
  /** Suppression optionnelle. */
  delete?(publicId: string): Promise<boolean>;
}
