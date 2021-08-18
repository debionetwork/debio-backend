import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QualityControlled } from "./models/quality-controlled.entity";
import { QualityControlledService } from "./quality-controlled.service";

@Module({
  imports: [TypeOrmModule.forFeature([QualityControlled])],
  exports: [TypeOrmModule, QualityControlledService],
  controllers: [],
  providers: [QualityControlledService],
})
export class QualityControlledModule {}