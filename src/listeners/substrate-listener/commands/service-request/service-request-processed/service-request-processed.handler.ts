import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  queryServiceInvoiceById,
  setOrderPaid,
  SubstrateService,
} from '../../../../../common';
import { ServiceRequestProcessedCommand } from './service-request-processed.command';

@Injectable()
@CommandHandler(ServiceRequestProcessedCommand)
export class ServiceRequestProcessedHandler
  implements ICommandHandler<ServiceRequestProcessedCommand>
{
  constructor(private readonly substrateService: SubstrateService) {}

  async execute(command: ServiceRequestProcessedCommand) {
    const serviceRequest = command.serviceInvoice;
    const serviceInvoice = await queryServiceInvoiceById(
      this.substrateService.api,
      serviceRequest.request_hash,
    );
    await setOrderPaid(
      this.substrateService.api,
      this.substrateService.pair,
      serviceInvoice['orderId'],
    );
  }
}
