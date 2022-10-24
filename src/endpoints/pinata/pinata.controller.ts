import { Controller, Post, UploadedFile } from "@nestjs/common";
import { PinataService } from "./pinata.service";

@Controller('pinata')
export class PinataController {
  constructor(private readonly pinataService: PinataService) {
    
  }

  @Post("/")
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const upload = await this.pinataService.uploadToPinata(file);

    return { data: upload.data };
  }
}