import { Body, Controller, Post, Res, UseInterceptors } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';
import { ProcessEnvProxy } from '../../common';
import { SentryInterceptor } from '../../common/interceptors';

@UseInterceptors(SentryInterceptor)
@Controller('recaptcha')
export class RecaptchaController {
  constructor(private readonly process: ProcessEnvProxy) {}

  @Post()
  async recaptcha(@Body() payload: any, @Res() response: Response) {
    const result = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify' +
        '?secret=' +
        this.process.env.RECAPTCHA_SECRET_KEY +
        '&response=' +
        payload.response,
    );
    const { data } = result;

    return response.status(200).json(data);
  }
}
