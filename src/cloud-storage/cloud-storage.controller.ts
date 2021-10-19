import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import {
  GCloudStorageService,
} from '@aginix/nestjs-gcloud-storage';
import { url } from 'inspector';

@Controller('gcs')
export class CloudStorageController {
  constructor(private readonly cloudStorageService: GCloudStorageService) {}
  
  @Get()
  async test() {
    return { status: 'ok' };
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