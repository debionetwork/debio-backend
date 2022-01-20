import { Module } from '@nestjs/common';
import { ProcessEnvModule } from '../../common';
import { RecaptchaController } from './recaptcha.controller';

@Module({
  imports: [ProcessEnvModule],
  controllers: [RecaptchaController],
})
export class RecaptchaModule {}
