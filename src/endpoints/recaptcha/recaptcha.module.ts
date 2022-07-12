import { Module } from '@nestjs/common';
import { RecaptchaController } from './recaptcha.controller';

@Module({
  controllers: [RecaptchaController],
})
export class RecaptchaModule {}
