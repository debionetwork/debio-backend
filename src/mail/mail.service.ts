import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmailCustomerStakingRequestService(
    sendTo: string,
    service_name: string,
    public_address: string,
    country: string,
    state: string,
    city: string,
    amount: number,
    currency: string,
  ) {
    await this.mailerService.sendMail({
      to: sendTo,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: `New Service Request - [${service_name}] - [${city}, ${state}, ${country}]` ,
      template: './customer-staking-request-service', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        service_name,
        public_address,
        country,
        state,
        city,
        amount,
        currency,
      },
    });
  }
  
  async sendEmailLabRegister(
    logo: string,
    email: string,
    phone_number: string | number,
    lab_name: string,
    country: string,
    state: string,
    city: string,
    address: string,
    certificates: Array<any>,
    services: Array<any>
  ){
    await this.mailerService.sendMail({
      to: 'jackyrahman443@gmail.com',
      subject: `New Lab Register – [${lab_name}] - [${city}, ${state}, ${country}]`,
      template: './lab-register', // `.hbs` extension is appended automatically,
      context: {
        logo,
        email,
        phone_number,
        lab_name,
        country,
        state,
        city,
        address,
        certificates,
        services
      }
    })
  }
  // =======testing and how to use this function===========
  // async onApplicationBootstrap(){
  //   console.log("test send mail");
  //   try {
  //     await this.sendEmailCustomerStakingRequestService(
  //       'jackyrahman443@gmail.com',
  //       'Service Request',
  //       '0x93943',
  //       'Indonesia',
  //       'Dki jakarta',
  //       'jakarta barat',
  //       300,
  //       'DAI'
  //       )
  
  //   } catch (error) {
  //     console.log(error);
  
  //   }
  // }
}
