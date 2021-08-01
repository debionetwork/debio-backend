import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabRating } from './models/rating.entity';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
// import dotenv from 'dotenv';

require('dotenv').config(); // eslint-disable-line
// dotenv.config();
@Module({
  imports: [TypeOrmModule.forFeature([LabRating])],
  exports: [TypeOrmModule],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
