import { ApiPromise } from '@polkadot/api';
import { ethers } from 'ethers'
import { TransactionLoggingDto } from '../common/transaction-logging/dto/transaction-logging.dto';
import { TransactionLoggingService } from '../common/transaction-logging/transaction-logging.service';
import { MailerManager } from '../common/mailer';
import { Logger } from '@nestjs/common';
import { CountryService } from '../endpoints/location/country.service';
import { StateService } from '../endpoints/location/state.service';

export class ServiceRequestEventHandler {
  constructor(
    private readonly countryService: CountryService,
    private readonly stateService: StateService,
    private api: ApiPromise,
    private mailerManager: MailerManager,
    private loggingService: TransactionLoggingService,
    private logger: Logger,
    ) {}
    
  handle(event) {
    switch (event.method) {
      case 'ServiceRequestProcessed':
        this.setOrderPaidFromServiceRequest(event);
        break;
      case 'ServiceRequestCreated':
        this.sendEmailNotificationServiceRequestCreated(event);
        this.insertStakingLoggingToDatabase(event)
        break;
      case 'ServiceRequestWaitingForUnstaked':
        this.insertWaitingForUnstakeLoggingToDatabase(event)
        break;
      case 'ServiceRequestUnstaked':
        this.insertUnstakeLoggingToDatabase(event)
        break;
    }
  }

  async setOrderPaidFromServiceRequest(event) {
    const serviceRequest = await event.data[0].toHuman();
    const serviceInvoice =
      await this.api.query.serviceRequest.serviceInvoiceById(
        serviceRequest.hash,
      );
    await this.api.tx.orders.setOrderPaid(serviceInvoice['orderId']);
  }

  async sendEmailNotificationServiceRequestCreated(event) {
    const serviceRequest = await event.data[1].toJSON();

    serviceRequest.country = ethers.utils.toUtf8String(serviceRequest.country)
    serviceRequest.region = ethers.utils.toUtf8String(serviceRequest.region)
    serviceRequest.city = ethers.utils.toUtf8String(serviceRequest.city)
    serviceRequest.stakingAmount = Number(serviceRequest.stakingAmount.split(',').join('')) / 10**18
    serviceRequest.serviceCategory = ethers.utils.toUtf8String(serviceRequest.serviceCategory)

    const countryName = await (await this.countryService.getByIso2Code(serviceRequest.country)).name
    const regionName = await (await this.stateService.getState(
      serviceRequest.country,
      serviceRequest.region
      )).name

    const context = {
      service_name: serviceRequest.serviceCategory,
      public_address: serviceRequest.requesterAddress,
      country: serviceRequest.country || countryName,
      state: serviceRequest.region || regionName,
      city: serviceRequest.city, 
      amount: serviceRequest.stakingAmount,
      currency: 'DBIO'
    }

    await this.mailerManager.sendCustomerStakingRequestServiceEmail(
      process.env.EMAILS.split(','),
      context
    )
  }

  async insertStakingLoggingToDatabase(event) {
    const serviceRequest = await event.data[1].toJSON();
    const stakingLogging : TransactionLoggingDto = {
      address: serviceRequest.requesterAddress,
      amount: Number(serviceRequest.stakingAmount)/ 10**18,
      created_at: new Date(parseInt(serviceRequest.createdAt)),
      currency: 'DBIO',
      parent_id: BigInt(0),
      ref_number: serviceRequest.hash,
      transaction_status: 7,
      transaction_type: 2
    }
    
    try {
      const isServiceRequestHasBeenInsert = await this.loggingService.getLoggingByHashAndStatus(
        serviceRequest.hash,
        7
      )
      if (!isServiceRequestHasBeenInsert) {
        await this.loggingService.create(stakingLogging)
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }

  async insertWaitingForUnstakeLoggingToDatabase(event) {
    const serviceRequest = await event.data[1].toJSON();
    
    try {
      const serviceRequestParent = await this.loggingService.getLoggingByOrderId(
        serviceRequest.hash
      )
      const isServiceRequestHasBeenInsert = await this.loggingService.getLoggingByHashAndStatus(
        serviceRequest.hash,
        11
      )
      const stakingLogging : TransactionLoggingDto = {
        address: serviceRequest.requesterAddress,
        amount: 0,
        created_at: new Date(),
        currency: 'DBIO',
        parent_id: BigInt(serviceRequestParent.id),
        ref_number: serviceRequest.hash,
        transaction_status: 11,
        transaction_type: 2
      }

      if(!isServiceRequestHasBeenInsert){
        await this.loggingService.create(stakingLogging)
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }

  async insertUnstakeLoggingToDatabase(event) {
    const serviceRequest = await event.data[1].toJSON();
    
    try {
      const serviceRequestParent = await this.loggingService.getLoggingByOrderId(
        serviceRequest.hash
      )
      const isServiceRequestHasBeenInsert = await this.loggingService.getLoggingByHashAndStatus(
        serviceRequest.hash,
        8
      )
      const stakingLogging : TransactionLoggingDto = {
        address: serviceRequest.requesterAddress,
        amount: Number(serviceRequest.stakingAmount)/ 10**18,
        created_at: new Date(),
        currency: 'DBIO',
        parent_id: BigInt(serviceRequestParent.id),
        ref_number: serviceRequest.hash,
        transaction_status: 8,
        transaction_type: 2
      }
      if(!isServiceRequestHasBeenInsert){
        await this.loggingService.create(stakingLogging)
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }

  async insertFinalizedLoggingToDatabase(event) {
    const serviceRequest = await event.data[1].toJSON();
    
    try {
      const serviceRequestParent = await this.loggingService.getLoggingByOrderId(
        serviceRequest.hash
      )
      const isServiceRequestHasBeenInsert = await this.loggingService.getLoggingByHashAndStatus(
        serviceRequest.hash,
        12
      )
      const stakingLogging : TransactionLoggingDto = {
        address: serviceRequest.requesterAddress,
        amount: Number(serviceRequest.stakingAmount)/ 10**18,
        created_at: new Date(),
        currency: 'DBIO',
        parent_id: BigInt(serviceRequestParent.id),
        ref_number: serviceRequest.hash,
        transaction_status: 12,
        transaction_type: 2
      }
      if(!isServiceRequestHasBeenInsert){
        await this.loggingService.create(stakingLogging)
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
