import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DateTimeModule } from '../../common/modules/proxies/date-time';
import { LabRating } from './models/rating.entity';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
// import dotenv from 'dotenv';
@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([LabRating]),
    DateTimeModule,
  ],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
