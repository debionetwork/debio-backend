import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { GCloudStorageService } from '@aginix/nestjs-gcloud-storage';

@Controller('gcs')
export class CloudStorageController {
  constructor(
    private readonly cloudStorageService: GCloudStorageService,
  ) {}

  @Get('/signed-url')
  async GetSignedUrl(
    @Query('filename') filename: string,
    @Query('action') action: string,
  ) {
    const URL_VALID_DURATION = 100000;
    const file = this.cloudStorageService.bucket.file(filename);

    if (action == 'write') {
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + URL_VALID_DURATION,
        contentType: 'application/x-www-form-urlencoded',
      });

      return {
        signedUrl: url,
      };
    }

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + URL_VALID_DURATION,
      contentType: 'application/x-www-form-urlencoded',
    });

    return {
      signedUrl: url,
    };
  }
}
