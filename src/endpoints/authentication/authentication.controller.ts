import { Controller, Headers, Get, Res, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { SentryInterceptor } from '../../common';
import { pinataJwtPayload } from './pinata-jwt.model';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { keyList } from '../../secrets';

@UseInterceptors(SentryInterceptor)
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
    private readonly jwtService: JwtService,
  ) {}

  @Get('/pinata-jwt')
  async PinataJwt(
    @Headers('debio-api-key') debioApiKey: string,
    @Res() response: Response,
  ) {
    if (
      !(
        debioApiKey ===
        this.gCloudSecretManagerService.getSecret('DEBIO_API_KEY').toString()
      )
    ) {
      return response.status(401).send('debio-api-key header is required');
    }

    const signJwt = await this.jwtService.signAsync(
      pinataJwtPayload(this.gCloudSecretManagerService),
      {
        secret: this.gCloudSecretManagerService
          .getSecret('PINATA_SECRET_KEY')
          .toString(),
        privateKey: undefined,
      },
    );
    return response.status(200).send({
      jwt: signJwt,
    });
  }
}
