import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { RecaptchaController } from './recaptcha.controller';

@Module({
  imports: [GCloudSecretManagerModule],
  controllers: [RecaptchaController],
})
export class RecaptchaModule {}
