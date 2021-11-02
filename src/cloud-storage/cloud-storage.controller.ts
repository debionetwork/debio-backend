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
    //TODO: Discuss return data
    const dataStakingSyncEvents = new DataStakingSyncEvents();
    dataStakingSyncEvents.filename = dto.filename;
    dataStakingSyncEvents.created_at = new Date();
    dataStakingSyncEvents.event_processed = false;
    return this.dataStakingSyncEventsRepository.save(dataStakingSyncEvents);
  }

  @Get('signed_url')
  async GetSignedUrl(
    @Query('filename') filename: string,
    @Query('action') action: string
  ) {
    const URL_VALID_DURATION = 100000;
    const file = this.cloudStorageService.bucket.file(filename);

    if(action == 'write'){
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + URL_VALID_DURATION,
        contentType: "application/x-www-form-urlencoded",
      });

      return {
        signedUrl: url
      };
    }

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + URL_VALID_DURATION,
      contentType: "application/x-www-form-urlencoded",
    });

    return {
      signedUrl: url
    };

  }
}