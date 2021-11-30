import { Module } from '@nestjs/common';
import { BountyController } from './bounty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataStakingEvents } from './models/data-staking-events.entity';
import { DateTimeModule } from 'src/common/date-time/date-time.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DataStakingEvents]),
    DateTimeModule,
  ],
  controllers: [BountyController],
})
export class BountyModule {}
