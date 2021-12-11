import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DataStakingDto } from './dto/data-staking.dto';
import { DataStakingEvents } from './models/data-staking-events.entity';
import { DateTimeProxy } from '../common/date-time/date-time.proxy';
import { DataTokenToDatasetMapping } from './models/data-token-to-dataset-mapping.entity';

@Controller('bounty')
export class BountyController {
  constructor(
    @InjectRepository(DataStakingEvents)
    private readonly dataStakingEventsRepository: Repository<DataStakingEvents>,
    @InjectRepository(DataTokenToDatasetMapping)
    private readonly dataTokenToDatasetMapping: Repository<DataTokenToDatasetMapping>,
    private readonly dateTimeProxy: DateTimeProxy
  ) {}

  @Post('/create-sync-event')
  @ApiBody({ type: DataStakingDto })
  async CreateSyncEvent(@Body() dto: DataStakingDto) {
    const dataStakingEvents = new DataStakingEvents();
    dataStakingEvents.order_id = dto.order_id;
    dataStakingEvents.service_category_id = dto.service_category_id;
    dataStakingEvents.filename = dto.filename;
    dataStakingEvents.created_at = new Date(this.dateTimeProxy.now());
    dataStakingEvents.event_processed = false;
    return await this.dataStakingEventsRepository.save(dataStakingEvents);
  }

  @Get('/staked-files')
  async StakedFiles(
    @Query('tokenId') tokenId: string,
  ) {
    return await this.dataTokenToDatasetMapping.find({ token_id: tokenId });
  }
}
