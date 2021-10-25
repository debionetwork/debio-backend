import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { DataBounty } from './models/bounty.entity';
import { ethers } from 'ethers';

@Injectable()
export class BountyService {
  constructor(
    @InjectRepository(DataBounty)
    private readonly dataBountyRepository: Repository<DataBounty>,
  ) {}

  create(data: CreateBountyDto) {
    const data_bounty = new DataBounty();
    
    data_bounty.hash_bounty_ocean = ethers.utils.sha256(ethers.utils.toUtf8Bytes(data.bounty_ocean));
    data_bounty.service_name = data.service_name;
    data_bounty.lab_name = data.lab_name;
    data_bounty.description = data.description;
    data_bounty.reward = data.reward;

    return this.dataBountyRepository.save(data_bounty);
  }
}
