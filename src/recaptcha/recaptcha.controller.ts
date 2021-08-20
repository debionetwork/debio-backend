import { Body, Controller, Post, Res } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';

@Controller('recaptcha')
export class RecaptchaController {
  @Post()
  async recaptcha(@Body() payload: any, @Res() response: Response) {
    const result = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify' +
        '?secret=' +
        process.env.RECAPTCHA_SECRET_KEY +
        '&response=' +
        payload.response,
    );
    const { data } = result;

    return response.status(200).json(data);
  }
}
