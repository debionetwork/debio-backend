import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServiceCategory } from "./models/service-category.service";
import { ServiceCategoryController } from "./service-category.controller";
import { ServiceCategoryService } from "./service-category.service";

@Module({
  imports: [TypeOrmModule.forFeature([ServiceCategory])],
  controllers: [ServiceCategoryController],
  providers: [ServiceCategoryService],
})
export class ServiceCategoryModule {}