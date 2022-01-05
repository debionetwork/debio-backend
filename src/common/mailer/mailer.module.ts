import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { forwardRef, Module } from '@nestjs/common';
import { join } from 'path';
import { LocationModule } from 'src/location/location.module';
import { MailerController } from './mailer.controller';
import { MailerManager } from './mailer.manager';

const plus = (value: string) => {
  return parseInt(value) + 1;
}
@Module({
  imports: [
    forwardRef(() => LocationModule),
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
        adapter: new HandlebarsAdapter({ plus: (value) => parseInt(value) + 1}), // or new PugAdapter() or new EjsAdapter()
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [MailerController],
  providers: [MailerManager],
  exports: [MailModule, MailerManager],
})
export class MailModule {}