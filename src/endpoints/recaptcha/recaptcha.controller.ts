import { Body, Controller, Post, Res, UseInterceptors } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';
import { GoogleSecretManagerService } from '../../common';
import { SentryInterceptor } from '../../common/interceptors';

@UseInterceptors(SentryInterceptor)
@Controller('recaptcha')
export class RecaptchaController {
  constructor(
    private readonly googleSecretManagerService: GoogleSecretManagerService,
  ) {}

  @Post()
  async recaptcha(@Body() payload: any, @Res() response: Response) {
    const result = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify' +
        '?secret=' +
        this.googleSecretManagerService.recaptchaSecretKey +
        '&response=' +
        payload.response,
    );

    const { data } = result;

    return response.status(200).json(data);
  }
}
