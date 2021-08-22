import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabRequest } from './models/lab_request.entity';

require('dotenv').config(); // eslint-disable-line
// dotenv.config();
@Module({
  imports: [TypeOrmModule.forFeature([LabRequest])],
  exports: [TypeOrmModule],
})
export class RatingModule {}
