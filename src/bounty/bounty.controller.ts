import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SubstrateService } from 'src/substrate/substrate.service';
import { BountyService } from './bounty.service';
import { CreateBountyDto } from './dto/create-bounty.dto';

@Controller('bounty')
export class BountyController {
	constructor(
		private substrateService: SubstrateService,
		private readonly bountyService: BountyService
	) {}

	@Post('/create-data-bounty')
	@ApiBody({ type: CreateBountyDto })
	async create(@Body() data: CreateBountyDto) {
		const resultDataBounty = await this.bountyService.create(data);
		
		await this.substrateService.submitStaking(resultDataBounty.hash_bounty_ocean);

		return {
			data: resultDataBounty
		}
	}
}
