import { Controller, Get } from "@nestjs/common";
import { EmrService } from "./emr.service";

@Controller('emr-category')
export class EmrController {
  constructor(
    private readonly emrService: EmrService,
  ) {}

  @Get() 
  getCategory() {
    try {
      return this.emrService.getAll()
    } catch (error) {
      console.log(error)
    }
  }
}