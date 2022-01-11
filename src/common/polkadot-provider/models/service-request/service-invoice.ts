export class ServiceInvoice {
  constructor(anyJson: any) {
    this.request_hash = anyJson.requestHash;
    this.order_id = anyJson.orderId;
    this.service_id = anyJson.serviceId;
    this.customer_address = anyJson.customerAddress;
    this.seller_address = anyJson.sellerAddress;
    this.dna_sample_tracking_id = anyJson.dnaSampleTrackingId;
    this.testing_price = anyJson.testingPrice;
    this.qc_price = anyJson.qcPrice;
    this.pay_amount = anyJson.payAmount;
  }

  request_hash: string;
  order_id: string;
  service_id: string;
  customer_address: string;
  seller_address: string;
  dna_sample_tracking_id: string;
  testing_price: number;
  qc_price: number;
  pay_amount: number;
}
