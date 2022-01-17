import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { MailerManager } from './mailer.manager';
import { EmailNotification} from './models'

require('dotenv').config(); // eslint-disable-line
@Module({
  imports: [
    TypeOrmModule.forFeature([EmailNotification]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS_EMAIL,
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
    }),
  ],
  providers: [MailerManager],
  exports: [MailModule, MailerManager, TypeOrmModule],
})
export class MailModule {}
