export interface UploadReturnType<T = Record<string, any>> {
  type: 'cloudinary' | 'fire_store';
  publicUrl: string;
  meta?: { userId: string; type?: string; [key: string]: any };
  results: T;
  filename: string;
}

export type UploadReturn<T = Record<string, any>> = {
  progress: number;
  data?: UploadReturnType<T>;
};
