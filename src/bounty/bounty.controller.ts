import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { BountyService } from './bounty.service';
import { CreateBountyDto } from './dto/create-bounty.dto';

@Controller('bounty')
export class BountyController {
	constructor(
		private readonly bountyService: BountyService
	) {}

	@Post('/create-data-bounty')
	@ApiBody({ type: CreateBountyDto })
	async create(@Body() data: CreateBountyDto) {
		const resultDataBounty = await this.bountyService.create(data);
		await this.bountyService.submitStaking(resultDataBounty.hash_bounty_ocean);

		return {
			data: resultDataBounty
		}
	}
}
