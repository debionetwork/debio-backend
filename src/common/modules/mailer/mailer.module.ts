import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
import {
  GoogleSecretManagerModule,
  GoogleSecretManagerService,
} from '../google-secret-manager';
import { MailerManager } from './mailer.manager';

require('dotenv').config(); // eslint-disable-line
@Module({
  imports: [
    GoogleSecretManagerModule,
    MailerModule.forRootAsync({
      imports: [GoogleSecretManagerModule],
      inject: [GoogleSecretManagerService],
      useFactory: async (
        googleSecretManagerService: GoogleSecretManagerService,
      ) => {
        await googleSecretManagerService.accessSecret();
        return {
          transport: {
            host: 'smtp.gmail.com',
            secure: false,
            auth: {
              user: googleSecretManagerService.email,
              pass: googleSecretManagerService.passEmail,
            },
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter({
              colNum: (value) => parseInt(value) + 1,
            }), // or new PugAdapter() or new EjsAdapter()
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [MailerManager],
  exports: [MailModule, MailerManager],
})
export class MailModule {}
