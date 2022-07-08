import { Module } from '@nestjs/common';
import { RecaptchaController } from './recaptcha.controller';

require('dotenv').config(); // eslint-disable-line
@Module({
  controllers: [RecaptchaController],
})
export class RecaptchaModule {}
