export interface UploadReturnType<T = Record<string, any>> {
  type: 'cloudinary' | 'fire_store';
  publicUrl: string;
  meta?: Record<string, any>;
  results: T;
  filename: string;
}

export type UploadReturn<T = Record<string, any>> = {
  progress: number;
  data?: UploadReturnType<T>;
};
