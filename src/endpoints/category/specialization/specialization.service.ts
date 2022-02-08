import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SpecializationCategory } from "./models/specialization.entity";

@Injectable()
export class SpecializationService {
  private readonly _logger : Logger = new Logger(SpecializationService.name)
  constructor(
    @InjectRepository(SpecializationCategory)
    private readonly specializationCategory: Repository<SpecializationCategory>,
  ) {}

  getAll() {
    try {
      return this.specializationCategory.find();
    } catch (error) {
      this._logger.log(error);
    }
  }
}