import { ServiceInvoice } from '../../../../../common';
import { BlockMetaData } from '../../../models/block-metadata.event-model';

export class ServiceRequestProcessedCommand {
  serviceInvoice: ServiceInvoice;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const serviceInvoiceData = args[1];
    this.serviceInvoice = new ServiceInvoice(serviceInvoiceData.toHuman());
  }
}
