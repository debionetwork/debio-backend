import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { DataBounty } from './models/bounty.entity';
import { ethers } from 'ethers';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class BountyService {
  constructor(
    @InjectRepository(DataBounty)
    private readonly dataBountyRepository: Repository<DataBounty>,
		private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async create(data: CreateBountyDto) {
    const data_bounty = new DataBounty();

    data_bounty.hash_bounty_ocean = ethers.utils.sha256(ethers.utils.toUtf8Bytes(data.bounty_ocean));
    data_bounty.service_name = data.service_name;
    data_bounty.lab_name = data.lab_name;
    data_bounty.description = data.description;
    data_bounty.reward = data.reward;

		const save_result = await this.dataBountyRepository.save(data_bounty);

		await this.elasticsearchService.index({
			index: 'data_bounty',
			refresh: 'wait_for',
			id: save_result.id.toString(),
			body: {
				id: save_result.id,
				hash_bounty_ocean: save_result.hash_bounty_ocean,
        service_name: save_result.service_name,
        lab_name: save_result.lab_name,
        description: save_result.description,
        reward: save_result.reward,
			},
		});

    return save_result;
  }
}
