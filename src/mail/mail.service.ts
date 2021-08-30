import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: string, token: string) {
    const url = `${token}`;

    await this.mailerService.sendMail({
      to: 'jackyrahman443@gmail.com',
      // from: '"Support Team" <support@example.com>', // override default from
      subject: '[Notification] New Service Request ',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: { // ✏️ filling curly brackets with content
        service_name: user
      },
    });
  }
  async onApplicationBootstrap(){
    console.log("test send mail");
    try {
      await this.sendUserConfirmation('Service Request', 'tes')
      
    } catch (error) {
      console.log(error);
      
    }
  }
}
