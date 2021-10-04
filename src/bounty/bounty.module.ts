import { Module } from '@nestjs/common';
import { BountyService } from './bounty.service';
import { BountyController } from './bounty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataBounty } from './models/bounty.entity';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
	imports: [
		TypeOrmModule.forFeature([DataBounty]),
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
      }),
    }),
	],
  providers: [BountyService],
  controllers: [BountyController]
})
export class BountyModule {}
