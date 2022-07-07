import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { RecaptchaController } from './recaptcha.controller';

@Module({
  imports: [GCloudSecretManagerModule.withConfig(process.env.PARENT)],
  controllers: [RecaptchaController],
})
export class RecaptchaModule {}
