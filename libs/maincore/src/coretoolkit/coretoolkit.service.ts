import { DataUtils } from '../databridge/databuilder/data.util';
import { Injectable } from '@nestjs/common';
import { FileUploadType } from './types/coretypes';
import { audioRegex, filesRegex, imageRegex, videoRegex } from './regex/regex';

@Injectable()
export class CoreToolkitService extends DataUtils {
  checktype(file: Express.Multer.File, check: FileUploadType) {
    let checker = false;
    let message = '';
    if (check.type === 'single') {
      if (check.source === 'image') {
        checker = imageRegex.test(file.filename);
        message =
          'Image format not supported, please check the image and try again';
      } else if (check.source === 'audio') {
        checker = audioRegex.test(file.filename);
        message =
          'Audio format not supported, please check the audio and try again';
      } else if (check.source === 'file') {
        checker = filesRegex.test(file.filename);
        message =
          'Document format not supported, please check the document and try again';
      } else if (check.source === 'video') {
        checker = videoRegex.test(file.filename);
        message =
          'Video format not supported, please check the video and try again';
      } else {
        checker = false;
        message = 'File format is not supported';
      }
    }
    return { checker, message };
  }
}
