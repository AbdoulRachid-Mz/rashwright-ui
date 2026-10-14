/**
 * lib/upload/upload-manager.ts — Orchestrateur d'upload.
 * Identique au code @rashwright/upload original.
 */
import type {
  IUploadProvider,
  UploadOptions,
  UploadResult,
  UploadSource,
  UploadTaskState,
} from "./types";

export interface UploadManagerOptions {
  provider: IUploadProvider;
  defaultOptions?: UploadOptions;
}

export class UploadManager {
  private readonly provider: IUploadProvider;
  private readonly defaultOptions?: UploadOptions;

  constructor(options: UploadManagerOptions) {
    this.provider = options.provider;
    this.defaultOptions = options.defaultOptions;
  }

  async upload(source: UploadSource, options?: UploadOptions): Promise<UploadResult> {
    const mergedOptions: UploadOptions = {
      ...this.defaultOptions,
      ...options,
    };
    return await this.provider.upload(source, mergedOptions);
  }

  async uploadMany(
    sources: UploadSource[],
    options?: UploadOptions & {
      concurrency?: number;
      onTaskUpdate?: (task: UploadTaskState) => void;
    },
  ): Promise<UploadResult[]> {
    const concurrency = options?.concurrency ?? 3;
    const results: UploadResult[] = [];
    const tasks: UploadTaskState[] = sources.map((s, idx) => ({
      id: `${Date.now()}_${idx}`,
      fileName: s.name,
      status: "idle",
      progress: 0,
    }));

    let index = 0;

    const worker = async (): Promise<void> => {
      while (index < sources.length) {
        const currentIndex = index++;
        const source = sources[currentIndex];
        const task = tasks[currentIndex];

        if (!source || !task) continue;

        task.status = "uploading";
        options?.onTaskUpdate?.(task);

        try {
          const res = await this.upload(source, {
            ...options,
            onProgress: (prog) => {
              task.progress = prog;
              options?.onTaskUpdate?.(task);
            },
          });

          task.status = "completed";
          task.progress = 100;
          task.result = res;
          results[currentIndex] = res;
          options?.onTaskUpdate?.(task);
        } catch (err) {
          task.status = "error";
          task.error = err instanceof Error ? err.message : String(err);
          options?.onTaskUpdate?.(task);
          throw err;
        }
      }
    };

    const workers = Array.from(
      { length: Math.min(concurrency, sources.length) },
      () => worker(),
    );
    await Promise.all(workers);

    return results;
  }
}

/** Factory simple. */
export function createUploader(options: UploadManagerOptions): UploadManager {
  return new UploadManager(options);
}
