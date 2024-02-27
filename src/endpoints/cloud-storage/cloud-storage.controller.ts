import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { DateTimeProxy, SentryInterceptor } from '../../common';
import { ApiResponse } from '@nestjs/swagger';
import { Client } from 'minio';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { config } from '../../config';

@UseInterceptors(SentryInterceptor)
@Controller('gcs')
export class CloudStorageController {
  constructor(
    private readonly dateTime: DateTimeProxy,
    @Inject(MINIO_CONNECTION) private readonly cloudStorageService: Client,
  ) {}

  @Get('/signed-url')
  @ApiResponse({
    description: 'Get signedUrl',
    status: 200,
    schema: {
      example: {
        signedUrl: 'https://.......',
      },
    },
  })
  async GetSignedUrl(
    @Query('filename') filename: string,
    @Query('action') action: 'read' | 'write',
  ) {
    const URL_VALID_DURATION = 100000;
    let url: string;
    if (action === 'read') {
      await this.cloudStorageService.presignedUrl(
        'GET',
        filename,
        filename,
        URL_VALID_DURATION,
        (err, res) => {
          url = res;
        },
      );

      return {
        signedUrl: url,
      };
    }

    await this.cloudStorageService.presignedUrl(
      'GET',
      config.BUCKET_NAME,
      filename,
      URL_VALID_DURATION,
      (err, res) => {
        url = res;
      },
    );

    return {
      signedUrl: url,
    };
  }
}
