import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { MailerManager } from './mailer.manager';

require('dotenv').config(); // eslint-disable-line
@Module({
  imports: [
    GCloudSecretManagerModule,
    MailerModule.forRootAsync({
      imports: [GCloudSecretManagerModule.withConfig(process.env.PARENT)],
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
        await gCloudSecretManagerService.loadSecrets();
        return {
          transport: {
            host: 'smtp.gmail.com',
            secure: false,
            auth: {
              user: gCloudSecretManagerService.getSecret('EMAIL').toString(),
              pass: gCloudSecretManagerService
                .getSecret('PASS_EMAIL')
                .toString(),
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
