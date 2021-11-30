import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DataStakingDto } from './dto/data-staking.dto';
import { DataStakingEvents } from './models/data-staking-events.entity';

@Controller('bounty')
export class BountyController {
  constructor(
    @InjectRepository(DataStakingEvents)
    private readonly dataStakingEventsRepository: Repository<DataStakingEvents>,
  ) {}

  @Post('/create-sync-event')
  @ApiBody({ type: DataStakingDto })
  async CreateSyncEvent(@Body() dto: DataStakingDto) {
    const dataStakingEvents = new DataStakingEvents();
    dataStakingEvents.order_id = dto.order_id;
    dataStakingEvents.service_category_id = dto.service_category_id;
    dataStakingEvents.filename = dto.filename;
    dataStakingEvents.created_at = new Date();
    dataStakingEvents.event_processed = false;
    return this.dataStakingEventsRepository.save(dataStakingEvents);
  }
}
