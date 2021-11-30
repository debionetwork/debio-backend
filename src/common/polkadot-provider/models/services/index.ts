import { ServiceFlow } from './service-flow';
import { ServiceInfo } from './service-info';

export class Service {
  constructor(anyJson: any) {
    this.id = anyJson.id;
    this.owner_id = anyJson.owner_id;
    this.info = anyJson.info;
    this.service_flow = anyJson.service_flow;
    this.price =
      this.info.prices_by_currency[0].price_components[0].value.toString();
    this.qc_price =
      this.info.prices_by_currency[0].additional_prices[0].value.toString();
  }
  id: string;
  owner_id: string;
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