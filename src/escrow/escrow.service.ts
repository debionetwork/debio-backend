import { Injectable } from '@nestjs/common';
import { formatEther, WalletSigner } from 'nestjs-ethers';
import { EthereumService } from 'src/ethereum/ethereum.service';
import { SubstrateService } from 'src/substrate/substrate.service';
import { Utils } from './utils/utils';
import { ethers } from 'ethers';

@Injectable()
export class EscrowService {
  private utils: Utils;
  constructor(
    private substrateService: SubstrateService,
    private ethereumService: EthereumService,
  ) {
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

  async forwardPaymentToSeller(sellerAddress: string, amount: number | string) {
    try {
      const tokenAmount = ethers.utils.parseUnits(String(amount), 18);
      const tokenContract = await this.ethereumService.getContract();
      const wallet: WalletSigner = await this.ethereumService.createWallet(
        process.env.DEBIO_ESCROW_PRIVATE_KEY,
      );
      const tokenContractWithSigner = tokenContract.connect(wallet);
      const options = {
        gasLimit: 60000,
        gasPrice: ethers.utils.parseUnits('100', 'gwei'),
      };
      const tx = await tokenContractWithSigner.transferFrom(
        wallet.address,
        sellerAddress,
        tokenAmount,
        options,
      );
      console.log('TODO: Save tx hash to DB', tx);
    } catch (error) {
      console.log(error);
    }
  }
}
