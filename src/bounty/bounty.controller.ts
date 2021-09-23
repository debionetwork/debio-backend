import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { BountyService } from './bounty.service';
import { CreateBountyDto } from './dto/create-bounty.dto';

@Controller('bounty')
export class BountyController {
	constructor(
		private readonly bountyService: BountyService
	) {}

	@Post()
	@ApiBody({ type: CreateBountyDto })
	async create(@Body() data: CreateBountyDto) {
		return {
			data: await this.bountyService.create(data)
		}
	}
}
