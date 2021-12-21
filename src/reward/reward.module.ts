import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheRedisModule } from 'src/cache-redis/cache-redis.module';
import { SubstrateModule } from '../substrate/substrate.module';
import { Reward } from './models/reward.entity';
import { RewardService } from './reward.service';

@Module({
  imports: [
    forwardRef(() => SubstrateModule),
    CacheRedisModule,
    TypeOrmModule.forFeature([Reward]),
  ],
  controllers: [],
  providers: [RewardService],
  exports: [TypeOrmModule, RewardService],
})
export class RewardModule {}
