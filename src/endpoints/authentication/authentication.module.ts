import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from './authentication.controller';

require('dotenv').config(); // eslint-disable-line
@Module({
  imports: [
    JwtModule.register({
      signOptions: {
        expiresIn: '5s',
      },
    }),
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
