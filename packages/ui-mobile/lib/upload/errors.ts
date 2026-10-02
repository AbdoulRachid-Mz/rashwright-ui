/**
 * lib/upload/errors.ts — UploadError local (remplace @rashwright/core après inlining)
 * Garantit que les composants upload-image/upload-video n'ont plus besoin d'aucun package workspace externe.
 */
export class UploadError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = "UploadError";
    if (details instanceof Error) {
      this.stack = `${this.stack}\nCaused by: ${details.stack}`;
    }
  }
}
