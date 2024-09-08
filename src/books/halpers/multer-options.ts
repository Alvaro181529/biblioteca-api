import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

function ensureDirectoryExists(directory: string) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}
const imageFileFilter = (req, file, callback) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return callback(null, true);
  }
  callback(new BadRequestException('Invalid image file type'), false);
};

const documentFileFilter = (req, file, callback) => {
  const allowedTypes = /pdf/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return callback(null, true);
  }
  callback(new BadRequestException('Invalid document file type'), false);
};

// Configuración para Multer
export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      let uploadPath = './uploads/imagen';
      if (file.mimetype === 'application/pdf') {
        uploadPath = './uploads/document';
      }
      ensureDirectoryExists(uploadPath);
      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      const fileExtName = extname(file.originalname);
      const fileName = Date.now() + fileExtName;
      callback(null, fileName);
    },
  }),
  fileFilter: (req, file: any, callback) => {
    if (file.mimetype === 'application/pdf') {
      return documentFileFilter(req, file, callback);
    }
    try {
      return imageFileFilter(req, file, callback);
    } catch (error) {
      callback(new BadRequestException('Invalid file type' + error), false);
    }
  },
};
