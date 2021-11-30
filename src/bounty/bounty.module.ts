import { Module } from '@nestjs/common';
import { BountyController } from './bounty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataStakingEvents } from './models/data-staking-events.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DataStakingEvents]),
  ],
  controllers: [BountyController],
})
export class BountyModule {}
