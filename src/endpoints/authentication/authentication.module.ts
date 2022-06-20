import { Module } from '@nestjs/common';
import { ProcessEnvModule } from '../../common/modules/proxies';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from './authentication.controller';
import { GoogleSecretManagerModule } from 'src/common';

@Module({
  imports: [
    GoogleSecretManagerModule,
    ProcessEnvModule,
    JwtModule.register({
      signOptions: {
        expiresIn: '5s',
      },
    }),
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
