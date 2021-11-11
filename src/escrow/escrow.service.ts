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

      // get sellerid (lab id)
      const sellerID = orderDetail['sellerId'];

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

      // get balance of sellerId (lab)
      const balance = await this.substrateService.getBalanceAccount(sellerID);

      // show balance of lab
      console.log('balance of lab : ', balance);

      // if balance is less than 0.5
      if (balance < 0.5) {
        // send 1 DBIO to lab
        await this.substrateService.sendDbioFromFaucet(
          sellerID,
          '1000000000000000000',
        );
      }

			const now = new Date();

			await this.elasticsearchService.index({
				index: 'payment-history',
				refresh: 'wait_for',
				id: lastOrderID,
				body: {
					id: lastOrderID,
					sendedAmount: strAmount,
					serviceId: orderDetail['serviceId'],
					customerBoxPublicKey: orderDetail['customerBoxPublicKey'],
					sellerId: orderDetail['sellerId'],
					dnaSampleTrackingId: orderDetail['dnaSampleTrackingId'],
					currency: orderDetail['currency'],
					prices: orderDetail['prices'],
					additionalPrices: orderDetail['additionalPrices'],
					status: orderDetail['status'],
					createdAt: orderDetail['createdAt'],
					updatedAt: orderDetail['updatedAt'],
					paymentDate: `${now.getUTCDate()}-${now.getUTCMonth() + 1}-${now.getUTCFullYear()}`,
				}
			});

      await this.substrateService.setOrderPaid(lastOrderID);
    } catch (error) {
      console.log('[handlePaymentToEscrow] failed: ', error);
    }
  }

  async createOrder(request) {
    console.log('[createOrder] request: ', request);
  }

  async refundOrder(order) {
    console.log('[refundOrder] order: ', order);
   try {
      const provider = await new ethers.providers.JsonRpcProvider(process.env.WEB3_RPC_HTTPS)
      const tokenContract = await this.ethereumService.getEscrowSmartContract();
      const wallet = await new ethers.Wallet(
        process.env.DEBIO_ESCROW_PRIVATE_KEY,
        provider
      )
      const balance = await provider.getBalance(wallet.address);
      console.log('balance', balance.toString());
      const tokenContractWithSigner = tokenContract.connect(wallet);
      try {
        const tx = await tokenContractWithSigner.refundOrder(
          order.id,
        );
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
    console.log('[orderFulfilled] order: ', order);
    try {
      
      const provider = await new ethers.providers.JsonRpcProvider(process.env.WEB3_RPC_HTTPS)
      const tokenContract = await this.ethereumService.getEscrowSmartContract();
      const wallet: WalletSigner = await this.ethereumService.createWallet(
        process.env.DEBIO_ESCROW_PRIVATE_KEY,
      );
      const tokenContractWithSigner = tokenContract.connect(wallet);
      const tx = await tokenContractWithSigner.fulfillOrder(
        order.id,
        provider
      );
      console.log('fullfilled order customerId :', order.customerId ,' ->', tx);
    } catch (error) {
      
    }
  }
  
  async setOrderPaidWithSubstrate(orderID: string) {
    try {
      await this.substrateService.setOrderPaid(orderID)
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
