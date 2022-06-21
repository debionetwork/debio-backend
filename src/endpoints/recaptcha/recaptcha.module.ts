import { Module } from '@nestjs/common';
import { GoogleSecretManagerModule } from '../../common';
import { RecaptchaController } from './recaptcha.controller';

@Module({
  imports: [GoogleSecretManagerModule],
  controllers: [RecaptchaController],
})
export class RecaptchaModule {}
