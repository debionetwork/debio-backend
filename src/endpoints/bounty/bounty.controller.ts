import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DataStakingDto } from './dto/data-staking.dto';
import { DataStakingEvents } from './models/data-staking-events.entity';
import { DateTimeProxy } from '../../common';
import { DataTokenToDatasetMapping } from './models/data-token-to-dataset-mapping.entity';
import { DataTokenToDatasetMappingDto } from './dto/data-token-to-dataset-mapping.dto';
import { SentryInterceptor } from '../../common';
import { Client } from 'minio';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { config } from '../../config';

@UseInterceptors(SentryInterceptor)
@Controller('bounty')
export class BountyController {
  constructor(
    @InjectRepository(DataStakingEvents)
    private readonly dataStakingEventsRepository: Repository<DataStakingEvents>,
    @InjectRepository(DataTokenToDatasetMapping)
    private readonly dataTokenToDatasetMapping: Repository<DataTokenToDatasetMapping>,
    @Inject(MINIO_CONNECTION) private readonly cloudStorageService: Client,
    private readonly dateTimeProxy: DateTimeProxy,
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
  async StakedFiles(@Query('tokenId') tokenId: string) {
    const mappings = await this.dataTokenToDatasetMapping.find({
      where: { token_id: tokenId },
    });

    const res: DataTokenToDatasetMappingDto[] = [];
    for (const x of mappings) {
      const URL_VALID_DURATION = 100000;
      let url: string;
      await this.cloudStorageService.presignedUrl(
        'GET',
        config.BUCKET_NAME,
        x.filename,
        URL_VALID_DURATION,
        (err, res) => {
          url = res;
        },
      );

      const dataTokenToDatasetMappingDto = new DataTokenToDatasetMappingDto(x);
      dataTokenToDatasetMappingDto.file_url = url;
      res.push(dataTokenToDatasetMappingDto);
    }

    return res;
  }
}
