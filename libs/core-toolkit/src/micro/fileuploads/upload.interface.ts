export interface IUpload {
  singleUpload(file: Express.Multer.File): any;
  multipleUploads(files: Express.Multer.File[]): any;
}
