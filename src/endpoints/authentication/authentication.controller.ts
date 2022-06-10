import { Controller, Headers, Get, Res, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ProcessEnvProxy } from '../../common/modules/proxies';
import { GoogleSecretManagerService, SentryInterceptor } from '../../common';
import { pinataJwtPayload } from './pinata-jwt.model';

@UseInterceptors(SentryInterceptor)
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly googleSecretManagerService: GoogleSecretManagerService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('/pinata-jwt')
  async PinataJwt(
    @Headers('debio-api-key') debioApiKey: string,
    @Res() response: Response,
  ) {
    if (!(debioApiKey === this.googleSecretManagerService.debioApiKey)) {
      return response.status(401).send('debio-api-key header is required');
    }

    const signJwt = await this.jwtService.signAsync(pinataJwtPayload, {
      secret: this.googleSecretManagerService.pinataSecretKey,
      privateKey: this.googleSecretManagerService.pinataPrivateKey,
    });
    return response.status(200).send({
      jwt: signJwt,
    });
  }
}
