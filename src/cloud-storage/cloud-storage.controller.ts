import {
  Controller,
  Get,
  Query,
  Post,
  Body,
} from '@nestjs/common';
import {
  GCloudStorageService,
} from '@aginix/nestjs-gcloud-storage';
import { Repository } from 'typeorm';
import { ApiBody } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { DataStakingSyncEvents } from './models/data-staking-sync-events.entity';
import { DataStakingDto } from './dto/data-staking.dto';

@Controller('gcs')
export class CloudStorageController {
  constructor(
    @InjectRepository(DataStakingSyncEvents)
    private readonly dataStakingSyncEventsRepository: Repository<DataStakingSyncEvents>,
    private readonly cloudStorageService: GCloudStorageService
  ) {}
  
	@Post('create_sync_event')
	@ApiBody({ type: DataStakingDto })
	async CreateSyncEvent(@Body() dto: DataStakingDto) {
    //TODO: Add download_url validation
    //TODO: Discuss return data
    const dataStakingSyncEvents = new DataStakingSyncEvents();
    dataStakingSyncEvents.download_url = dto.download_url;
    dataStakingSyncEvents.created_at = new Date();
    dataStakingSyncEvents.event_processed = false;
    return this.dataStakingSyncEventsRepository.save(dataStakingSyncEvents);
  }

  @Get('signed_url')
  async GetSignedUrl(
    @Query('filename') filename: string
  ) {
    const URL_VALID_DURATION = 100000;
    var file = this.cloudStorageService.bucket.file(filename);
    var [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + URL_VALID_DURATION,
      contentType: "application/x-www-form-urlencoded",
    });

    return {
      signedUrl: url
    };
  }
}