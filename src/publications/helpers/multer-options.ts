import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ensureDirectoryExists,
  imageFileFilter,
} from 'src/books/halpers/multer-options';

export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      const uploadPath = './uploads/publication';
      ensureDirectoryExists(uploadPath);
      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      const fileExtName = extname(file.originalname);
      const fileName = Date.now() + fileExtName;
      callback(null, fileName);
    },
  }),
  fileFilter: (req: any, file: any, callback: any) => {
    try {
      return imageFileFilter(req, file, callback);
    } catch (error) {
      callback(new BadRequestException('Invalid file type' + error), false);
    }
  },
};
