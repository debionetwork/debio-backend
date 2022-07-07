import { Controller, Headers, Get, Res, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { SentryInterceptor } from '../../common';
import { pinataJwtPayload } from './pinata-jwt.model';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

@UseInterceptors(SentryInterceptor)
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly gCloudSecretManagerService: GCloudSecretManagerService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('/pinata-jwt')
  async PinataJwt(
    @Headers('debio-api-key') debioApiKey: string,
    @Res() response: Response,
  ) {
    await this.gCloudSecretManagerService.loadSecrets();

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
    );
    return response.status(200).send({
      jwt: signJwt,
    });
  }
}
