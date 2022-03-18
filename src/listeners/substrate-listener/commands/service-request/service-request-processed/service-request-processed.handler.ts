import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubstrateService } from '../../../../../common';
import {
  queryServiceInvoiceById,
  setOrderPaid,
} from '@debionetwork/polkadot-provider';
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
      this.substrateService.api as any,
      serviceRequest.requestHash,
    );
    await setOrderPaid(
      this.substrateService.api as any,
      this.substrateService.pair,
      serviceInvoice['orderId'],
    );
  }
}
