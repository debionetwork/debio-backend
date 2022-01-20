import { Injectable } from '@nestjs/common';
import { WalletSigner } from 'nestjs-ethers';
import { EthereumService, ProcessEnvProxy, setOrderPaid, SubstrateService } from '../../common';
import { ethers } from 'ethers';

@Injectable()
export class EscrowService {
  constructor(
    private readonly process: ProcessEnvProxy,
    private readonly substrateService: SubstrateService,
    private readonly ethereumService: EthereumService,
  ) {}

  async createOrder(request) {
    console.log('[createOrder] request: ', request);
  }

  async refundOrder(order) {
    console.log('[refundOrder] order: ', order);
    try {
      const provider = await new ethers.providers.JsonRpcProvider(
        this.process.env.WEB3_RPC_HTTPS,
      );
      const tokenContract = this.ethereumService.getEscrowSmartContract();
      const wallet = await new ethers.Wallet(
        this.process.env.DEBIO_ESCROW_PRIVATE_KEY,
        provider,
      );
      const balance = await provider.getBalance(wallet.address);
      console.log('balance', balance.toString());
      const tokenContractWithSigner = tokenContract.connect(wallet);
      try {
        await tokenContractWithSigner.refundOrder(order.id);
      } catch (err) {
        console.log('err', err);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async cancelOrder(request) {
    console.log('[cancelOrder] request: ', request);
  }

  async orderFulfilled(order) {
    try {
      await new ethers.providers.JsonRpcProvider(process.env.WEB3_RPC_HTTPS);
      const tokenContract = this.ethereumService.getEscrowSmartContract();
      const wallet: WalletSigner = await this.ethereumService.createWallet(
        this.process.env.DEBIO_ESCROW_PRIVATE_KEY,
      );
      const tokenContractWithSigner = tokenContract.connect(wallet);
      const tx = await tokenContractWithSigner.fulfillOrder(order.id);
      console.log('fullfilled order customerId :', order.customerId, ' ->', tx);
    } catch (error) {
      console.log(error);
    }
  }

  async setOrderPaidWithSubstrate(orderId: string) {
    try {
      await setOrderPaid(
        this.substrateService.api,
        this.substrateService.pair,
        orderId,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async forwardPaymentToSeller(sellerAddress: string, amount: number | string) {
    try {
      const tokenAmount = ethers.utils.parseUnits(String(amount), 18);
      const tokenContract = this.ethereumService.getContract();
      const wallet: WalletSigner = await this.ethereumService.createWallet(
        this.process.env.DEBIO_ESCROW_PRIVATE_KEY,
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
