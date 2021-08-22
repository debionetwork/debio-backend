import { Injectable, Logger } from '@nestjs/common';
import { formatEther, WalletSigner } from 'nestjs-ethers';
import { EthereumService } from '../ethereum/ethereum.service';
import { SubstrateService } from '../substrate/substrate.service';
import { Utils } from './utils/utils';
import { ethers } from 'ethers';
import ABI from '../ethereum/utils/ABI.json';

@Injectable()
export class EscrowService {
  private utils: Utils;
  private readonly logger: Logger = new Logger(SubstrateService.name);
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
    try {
      const buyerEthAddress =
        await this.substrateService.getEthAddressByAccountId(
          request.customer_id,
        );

      const totalPrice = request.prices.reduce(
        (acc, price) => acc + price.value,
        0,
      );

      this.logger.log('refundOrder Event');
      this.logger.log('Forwarding payment to customer');
      this.logger.log(`labEthAddress: ${buyerEthAddress}`);
      this.logger.log(`amountToForward: ${totalPrice}`);
      const tx = await this.forwardPaymentToSeller(buyerEthAddress, totalPrice);
      this.logger.log(`Forward payment transaction sent | tx -> ${tx}`);
    } catch (error) {
      console.log(error);
      this.logger.log(`Forward payment refund failed | err -> ${error}`);
    }

    try {
      this.substrateService.setOrderRefunded(request.id);
    } catch (error) {
      console.log(error);
      this.logger.log(`set order refunded failed | err -> ${error}`);
    }
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
