import { Injectable } from '@nestjs/common';
import { formatEther } from 'nestjs-ethers';
import { SubstrateService } from 'src/substrate/substrate.service';
import { Utils } from './utils/utils';

@Injectable()
export class EscrowService {
  private utils: Utils;

  constructor(private substrateService: SubstrateService) {
    this.utils = new Utils();
  }

  async handlePaymentToEscrow(from, amount) {
    console.log('[handlePaymentToEscrow] from:', from, ' amount:', amount);
    try {
      const strAmount = await formatEther(amount);
      console.log(strAmount);

      const substrateAddr =
        await this.substrateService.getSubstrateAddressByEthAddress(from);
      const lastOrderID = await this.substrateService.getLastOrderByCustomer(
        substrateAddr,
      );

      const orderDetail = await this.substrateService.getOrderDetailByOrderID(
        lastOrderID,
      );

      const priceList = this.utils.GetDetailPrice(orderDetail);
      const totalPrice = priceList[0] + priceList[1];

      if (parseInt(strAmount, 10) != totalPrice) {
        console.log(
          '[handlePaymentToEscrow] return cancel.',
          strAmount,
          ' : ',
          totalPrice,
        );
        return;
      }

      await this.substrateService.setOrderPaid(lastOrderID);
    } catch (error) {
      console.log('[handlePaymentToEscrow] failed: ', error);
    }
  }

  async createOrder(request) {
    console.log('[createOrder] request: ', request);
  }

  async refundOrder(request) {
    console.log('[refundOrder] request: ', request);
  }

  async cancelOrder(request) {
    console.log('[cancelOrder] request: ', request);
  }

  async orderSuccess(request) {
    console.log('[orderSuccess] request: ', request);
  }
}
