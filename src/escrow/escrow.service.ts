import { Injectable } from '@nestjs/common';
import { formatEther, WalletSigner } from 'nestjs-ethers';
import { EthereumService } from '../ethereum/ethereum.service';
import { SubstrateService } from '../substrate/substrate.service';
import { Utils } from './utils/utils';
import { ethers } from 'ethers';
import ABI from '../ethereum/utils/ABI.json';

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

      // get sellerid (lab id)
      const sellerID = orderDetail['seller_id'];

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
      if(balance < 0.5) {
        // send 1 DBIO to lab
        await this.substrateService.sendDbioFromFaucet(
          sellerID, 
          '1000000000000000000'
        );
      }

      await this.substrateService.setOrderPaid(lastOrderID);
    } catch (error) {
      console.log('[handlePaymentToEscrow] failed: ', error);
    }
  }

  async createOrder(request) {
    console.log('[createOrder] request: ', request);
  }

  async refundOrder(order) {
    console.log('[refundOrder] request: ', order);
    try {
      const provider = await new ethers.providers.JsonRpcProvider(process.env.WEB3_RPC_HTTPS)
      const tokenContract = await this.ethereumService.getEscrowSmartContract();
      const wallet = await new ethers.Wallet(
        process.env.DEBIO_ESCROW_PRIVATE_KEY,
        provider
      )
      const balance = await provider.getBalance(wallet.address);
      console.log('balance', balance.toString());
      // this.ethereumService.createWallet(
      //   process.env.DEBIO_ESCROW_PRIVATE_KEY,
      // );
      //console.log('3',JSON.stringify(wallet, null, 2));
      const tokenContractWithSigner = tokenContract.connect(wallet);
      try {
        const tx = await tokenContractWithSigner.refundOrder(
          order.id,
          // { gasPrice: '2000000000', gasLimit: '1000000000'},
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

  async orderFulfilled(request) {
    console.log('[orderFulfilled] request: ', request);
    try {
      
      const provider = await new ethers.providers.JsonRpcProvider(process.env.WEB3_RPC_HTTPS)
      const tokenContract = await this.ethereumService.getEscrowSmartContract();
      const wallet: WalletSigner = await this.ethereumService.createWallet(
        process.env.DEBIO_ESCROW_PRIVATE_KEY,
      );
      const tokenContractWithSigner = tokenContract.connect(wallet);
      const tx = await tokenContractWithSigner.fulfillOrder(
        request.id,
        provider
      );
      console.log('fullfilled order customer_id :', request.customer_id ,' ->', tx);
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
