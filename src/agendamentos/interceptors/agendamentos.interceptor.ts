import { BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

export const AgendamentosInterceptor = FileInterceptor('arquivo', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req: any, file: any, callback: any) => {
      const uniqueSuffix =
        Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(ics)$/)) {
      return callback(
        new BadRequestException('Apenas arquivos ICS são permitidos!'),
        false,
      );
    }
    callback(null, true);
  },
});