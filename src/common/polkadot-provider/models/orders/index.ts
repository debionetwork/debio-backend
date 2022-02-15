import { ServiceFlow, Price, CurrencyType } from '..';
import { OrderStatus } from './order-status';
import { convertSubstrateBalanceToNumber, convertSubstrateNumberToNumber } from '../..';

export class Order {
  constructor(anyJson: any) {
    this.id = anyJson.id;
    this.service_id = anyJson.serviceId;
    this.customer_id = anyJson.customerId;
    this.customer_box_public_key = anyJson.customerBoxPublicKey;
    this.seller_id = anyJson.sellerId;
    this.dna_sample_tracking_id = anyJson.dnaSampleTrackingId;
    this.currency = anyJson.currency;
    this.prices = anyJson.prices;
    this.additional_prices = anyJson.additionalPrices;
    this.status = anyJson.status;
    this.order_flow = anyJson.orderFlow;
    this.created_at = anyJson.createdAt;
    this.updated_at = anyJson.updatedAt;
  }

  id: string;
  service_id: string;
  customer_id: string;
  customer_box_public_key: string;
  seller_id: string;
  dna_sample_tracking_id: string;
  currency: CurrencyType;
  prices: Price[];
  additional_prices: Price[];
  status: OrderStatus;
  order_flow: ServiceFlow;
  created_at: Date;
  updated_at: Date;
  
  humanToOrderListenerData(){
    const order: Order = this;
    order.additional_prices[0].value = convertSubstrateBalanceToNumber(
      order.additional_prices[0].value
    );
  
    order.prices[0].value = convertSubstrateBalanceToNumber(
      order.prices[0].value
    );
  
    order.created_at = new Date(
      convertSubstrateNumberToNumber(order.created_at)
    )
  
    if (order.updated_at) {
      order.updated_at = new Date(
        convertSubstrateNumberToNumber(order.updated_at)
      ) 
    }  
  
    return order
  }
}

export * from './order-status';
