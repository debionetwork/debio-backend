import { CacheModule, Module } from '@nestjs/common';
import { BountyService } from './bounty.service';
import { BountyController } from './bounty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataBounty } from './models/bounty.entity';

@Module({
	imports: [TypeOrmModule.forFeature([DataBounty])],
  providers: [BountyService],
  controllers: [BountyController]
})
export class BountyModule {}
