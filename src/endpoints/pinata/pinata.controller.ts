import { Controller, Post, UploadedFile } from "@nestjs/common";

@Controller('pinata')
export class PinataController {
  constructor() {
    
  }

  @Post("/")
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    
  }
}