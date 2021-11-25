import { Injectable } from '@nestjs/common';
import { formatEther, WalletSigner } from 'nestjs-ethers';
import { EthereumService } from '../ethereum/ethereum.service';
import { SubstrateService } from '../substrate/substrate.service';
import { Utils } from './utils/utils';
import { ethers } from 'ethers';
import ABI from '../ethereum/utils/ABI.json';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class EscrowService {
  private utils: Utils;
  constructor(
    private substrateService: SubstrateService,
    private ethereumService: EthereumService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {
    this.utils = new Utils();
  }

  async createOrder(request) {
    console.log('[createOrder] request: ', request);
  }

  async refundOrder(order) {
    console.log('[refundOrder] order: ', order);
    try {
      const provider = await new ethers.providers.JsonRpcProvider(
        process.env.WEB3_RPC_HTTPS,
      );
      const tokenContract = await this.ethereumService.getEscrowSmartContract();
      const wallet = await new ethers.Wallet(
        process.env.DEBIO_ESCROW_PRIVATE_KEY,
        provider,
      );
      const balance = await provider.getBalance(wallet.address);
      console.log('balance', balance.toString());
      const tokenContractWithSigner = tokenContract.connect(wallet);
      try {
        const tx = await tokenContractWithSigner.refundOrder(order.id);
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
      const provider = await new ethers.providers.JsonRpcProvider(
        process.env.WEB3_RPC_HTTPS,
      );
      const tokenContract = await this.ethereumService.getEscrowSmartContract();
      const wallet: WalletSigner = await this.ethereumService.createWallet(
        process.env.DEBIO_ESCROW_PRIVATE_KEY,
      );
      const tokenContractWithSigner = tokenContract.connect(wallet);
      const tx = await tokenContractWithSigner.fulfillOrder(order.id);
      console.log('fullfilled order customerId :', order.customerId, ' ->', tx);
    } catch (error) {
      console.log(error);
    }
  }

  async setOrderPaidWithSubstrate(orderID: string) {
    try {
      await this.substrateService.setOrderPaid(orderID);
    } catch (error) {
      console.log(error);
    }
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

  /**
   * Get refund gas estimation:
   * Refund is done by calling the transferFrom function of ERC20 token
   * The transfer is done from escrow's address to the customer address
   * @param customerAddress : customer address
   * @param amount : amount of erc20 being transferred to customer
   * @returns string
   */
  async getRefundGasEstimationFee(
    customerAddress: string,
    amount: number | string,
  ): Promise<string> {
    const escrowAddress = process.env.DEBIO_ETH_ADDRESS;
    const erc20Address = process.env.CONTRACT_ADDRESS;
    const tokenAmount = ethers.utils.parseUnits(String(amount), 18);

    const iface = new ethers.utils.Interface(ABI);
    const encoded = iface.encodeFunctionData('transferFrom', [
      escrowAddress,
      customerAddress,
      tokenAmount,
    ]);

    const gasEstimation: string =
      await this.ethereumService.getGasEstimationFee(
        escrowAddress,
        erc20Address,
        encoded,
      );

    return gasEstimation;
  }
}
