import { Module } from '@nestjs/common';
import { BountyController } from './bounty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataStakingEvents } from './models/data-staking-events.entity';
import { DateTimeModule } from 'src/common/date-time/date-time.module';
import { DataTokenToDatasetMapping } from './models/data-token-to-dataset-mapping.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DataStakingEvents, 
      DataTokenToDatasetMapping
    ]),
    DateTimeModule,
  ],
  controllers: [BountyController],
})
export class BountyModule {}
