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

		const save_result = await this.dataBountyRepository.save(data_bounty);

    return save_result;
  }
}
