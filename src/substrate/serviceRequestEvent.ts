import { ApiPromise } from '@polkadot/api';
import { ethers } from 'ethers'
import { MailerManager } from '../common/mailer';

export class ServiceRequestEventHandler {
  constructor(
    private api: ApiPromise,
    private mailerManager: MailerManager
    ) {}
    
  handle(event) {
    switch (event.method) {
      case 'ServiceRequestProcessed':
        this.setOrderPaidFromServiceRequest(event);
        break;
      case 'ServiceRequestCreated':
        this.sendEmailNotificationServiceRequestCreated(event);
        break;
    }
  }

  async setOrderPaidFromServiceRequest(event) {
    const serviceRequest = await event.data[0].toHuman();
    const serviceInvoice =
      await this.api.query.serviceRequest.serviceInvoiceById(
        serviceRequest.hash_,
      );
    await this.api.tx.orders.setOrderPaid(serviceInvoice['orderId']);
  }

  async sendEmailNotificationServiceRequestCreated(event) {
    console.log('masuk email nih',  process.env.EMAILS.split(','));
    
    const serviceRequest = await event.data[1].toJSON();

    console.log(1, serviceRequest);
    

    serviceRequest.country = ethers.utils.toUtf8String(serviceRequest.country)
    serviceRequest.region = ethers.utils.toUtf8String(serviceRequest.region)
    serviceRequest.city = ethers.utils.toUtf8String(serviceRequest.city)
    serviceRequest.serviceCategory = ethers.utils.toUtf8String(serviceRequest.serviceCategory)

    const context = {
      service_name: serviceRequest.serviceCategory,
      public_address: serviceRequest.requesterAddress,
      country: serviceRequest.country,
      state: serviceRequest.region,
      city: serviceRequest.city, 
      amount: serviceRequest.stakingAmount,
      currency: 'DBIO'
    }

    console.log('service Request: ', serviceRequest);
    await this.mailerManager.sendCustomerStakingRequestServiceEmail(
      process.env.EMAILS.split(','),
      context
    )
  }
}
