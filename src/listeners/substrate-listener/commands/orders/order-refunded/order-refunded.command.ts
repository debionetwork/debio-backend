import { Order } from "../../../../../common";
import { BlockMetaData } from "../../../models/block-metadata.event-model";

export class OrderRefundedCommand {
  orders: Order;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const orderData = data[0];
    this.orders = new Order(orderData.toHuman());
  }
}
