import { Body, Controller, Post, Res, UseInterceptors } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';
import { SentryInterceptor } from '../../common/interceptors';
import { config } from '../../config';

@UseInterceptors(SentryInterceptor)
@Controller('recaptcha')
export class RecaptchaController {
  @Post()
  async recaptcha(@Body() payload: any, @Res() response: Response) {
    const result = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify' +
        '?secret=' +
        config.RECAPTCHA_SECRET_KEY.toString() +
        '&response=' +
        payload.response,
    );

    const { data } = result;

    return response.status(200).json(data);
  }
}
