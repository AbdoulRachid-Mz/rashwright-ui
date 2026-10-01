export interface UploadSource {
  name: string;
  type: string;
  uri: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface UploadOptions {
  folder?: string;
  onProgress?: (progress: number) => void;
}

export interface IUploadProvider {
  upload(source: UploadSource, options?: UploadOptions): Promise<UploadResult>;
}

export class UploadManager {
  private provider: IUploadProvider;

  constructor({ provider }: { provider: IUploadProvider }) {
    this.provider = provider;
  }

  async upload(source: UploadSource, options?: UploadOptions): Promise<UploadResult> {
    return this.provider.upload(source, options);
  }
}
