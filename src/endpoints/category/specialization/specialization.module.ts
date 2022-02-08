import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SpecializationCategory } from "./models/specialization.entity";
import { SpecializationController } from "./specialization.controller";
import { SpecializationService } from "./specialization.service";

@Module({
  imports: [TypeOrmModule.forFeature([SpecializationCategory])],
  controllers: [SpecializationController],
  providers: [SpecializationService],
})
export class SpecializationModule {}