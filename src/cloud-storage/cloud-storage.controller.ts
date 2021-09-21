import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  GCloudStorageService,
} from '@aginix/nestjs-gcloud-storage';

@Controller('gcs')
export class CloudStorageController {
  constructor(private readonly cloudStorageService: GCloudStorageService) {}
  
  @Get('signed_url')
  GetSignedUrl(
    filename: string
  ) {
    const URL_VALID_DURATION = 1000;
    var file = this.cloudStorageService.bucket.file(filename);
    file.getSignedUrl({
      action: 'write',
      expires: Date.now() + URL_VALID_DURATION
    }, function (err, url) {
      if (err) {
        console.error(err);
        return;
      }
      return url;
    });
  }
}