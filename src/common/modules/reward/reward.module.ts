import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DebioConversionModule } from '../debio-conversion/debio-conversion.module';

import { SubstrateModule } from '../substrate';
import { Reward } from './models/reward.entity';
import { RewardService } from './reward.service';

@Module({
  imports: [
    SubstrateModule,
    DebioConversionModule,
    TypeOrmModule.forFeature([Reward]),
  ],
  controllers: [],
  providers: [RewardService],
  exports: [TypeOrmModule, RewardService],
})
export class RewardModule {}
