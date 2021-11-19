import { ApiPromise } from '@polkadot/api';

export class ServiceRequestEventHandler {
  constructor(private api: ApiPromise) {}

  handle(event) {
    switch (event.method) {
      case 'ServiceRequestProcessed':
        this.setOrderPaidFromServiceRequest(event);
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
}
