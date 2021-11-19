import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmrController } from './emr.controller';
import { EmrService } from './emr.service';
import { EmrCategory } from './models/emr.entity';
require('dotenv').config(); // eslint-disable-line

@Module({
  imports: [TypeOrmModule.forFeature([EmrCategory])],
  controllers: [EmrController],
  providers: [EmrService],
})
export class EmrModule {}
