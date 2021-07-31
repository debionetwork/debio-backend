import { Injectable } from '@nestjs/common';
import { formatEther } from 'nestjs-ethers';

@Injectable()
export class EscrowService {
  async handlePaymentToEscrow(from, amount) {
    console.log('[handlePaymentToEscrow] from:', from, ' amount:', amount);

    try {
      const price = await formatEther(amount);
      console.log(price);
    } catch (error) {
      console.log(error);
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
