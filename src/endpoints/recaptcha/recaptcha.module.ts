import { Module } from '@nestjs/common';
import { GoogleSecretManagerModule, ProcessEnvModule } from '../../common';
import { RecaptchaController } from './recaptcha.controller';

@Module({
  imports: [ProcessEnvModule, GoogleSecretManagerModule],
  controllers: [RecaptchaController],
})
export class RecaptchaModule {}
