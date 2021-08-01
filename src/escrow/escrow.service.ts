import { Injectable } from '@nestjs/common';
import { formatEther } from 'nestjs-ethers';
import { SubstrateService } from 'src/substrate/substrate.service';

@Injectable()
export class EscrowService {
  /**
   *
   */
  constructor(private substrateService: SubstrateService) {}
  async handlePaymentToEscrow(from, amount) {
    console.log('[handlePaymentToEscrow] from:', from, ' amount:', amount);

    try {
      const price = await formatEther(amount);
      console.log(price);
    } catch (error) {
      console.log(error);
    }

    this.substrateService.setOrderPaid('123');
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
