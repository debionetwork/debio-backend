import { Controller, Get, Query } from '@nestjs/common';
import { GCloudStorageService } from '@aginix/nestjs-gcloud-storage';
import { DateTimeProxy } from 'src/common/date-time/date-time.proxy';

@Controller('gcs')
export class CloudStorageController {
  constructor(
    private readonly dateTime: DateTimeProxy,
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
        expires: this.dateTime.nowAndAdd(URL_VALID_DURATION),
        contentType: 'application/x-www-form-urlencoded',
      });

      return {
        signedUrl: url,
      };
    }

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: this.dateTime.nowAndAdd(URL_VALID_DURATION),
      contentType: 'application/x-www-form-urlencoded',
    });

    return {
      signedUrl: url,
    };
  }
}
