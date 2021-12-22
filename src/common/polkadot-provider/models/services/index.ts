import { ServiceFlow } from './service-flow';
import { ServiceInfo } from './service-info';

export class Service {
  constructor(anyJson: any) {
    this.id = anyJson.id;
    this.owner_id = anyJson.ownerId;
    this.info = anyJson.info;
    this.service_flow = anyJson.serviceFlow;
    this.price =
      this.info.pricesByCurrency[0].priceComponents[0].value.toString();
    this.qc_price =
      this.info.pricesByCurrency[0].additionalPrices[0].value.toString();
    this.currency = this.info.pricesByCurrency[0].currency
  }
  id: string;
  owner_id: string;
  currency: string;
  price: string;
  qc_price: string;
  info: ServiceInfo;
  service_flow: ServiceFlow;
}

export * from './expected-duration';
export * from './price';
export * from './price-by-currency';
export * from './service-flow';
export * from './service-info';