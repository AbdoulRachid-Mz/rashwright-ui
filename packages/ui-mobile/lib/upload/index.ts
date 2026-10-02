/**
 * lib/upload/index.ts — Barrel principal du système d'upload Rashwright (INLINÉ).
 *
 * Ce fichier remplace l'ancien package npm @rashwright/upload (workspace:*).
 * Tout est embarqué DANS @rashwright/ui-mobile. Les utilisateurs n'ont pas besoin
 * d'installer un package supplémentaire.
 */

// 1) Erreur locale (remplace @rashwright/core UploadError)
export { UploadError } from "./errors";

// 2) Contrats et types
export type {
  UploadSource,
  UploadOptions,
  UploadResult,
  UploadStatus,
  UploadTaskState,
  IUploadProvider,
} from "./types";

// 3) Orchestrateur principal
export {
  UploadManager,
  createUploader,
  type UploadManagerOptions,
} from "./upload-manager";

// 4) Providers (Cloud / API / Mock)
export {
  CloudinaryProvider,
  type CloudinaryConfig,
} from "./providers/cloudinary-provider";

export {
  FirebaseStorageProvider,
  type FirebaseStorageConfig,
} from "./providers/firebase-provider";

export {
  VercelBlobProvider,
  type VercelBlobConfig,
} from "./providers/vercel-blob-provider";

export {
  LocalUploadProvider,
  type LocalUploadConfig,
} from "./providers/local-provider";

export {
  MockUploadProvider,
  type MockProviderOptions,
} from "./providers/mock-provider";
