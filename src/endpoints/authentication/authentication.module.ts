import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from './authentication.controller';

@Module({
  imports: [
    GCloudSecretManagerModule.withConfig(process.env.PARENT),
    JwtModule.register({
      signOptions: {
        expiresIn: '5s',
      },
    }),
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
