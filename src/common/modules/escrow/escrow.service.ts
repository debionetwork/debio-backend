import { Injectable } from '@nestjs/common';
import { WalletSigner } from 'nestjs-ethers';
import { EthereumService, ProcessEnvProxy, SubstrateService } from '../..';
import { setOrderPaid } from '@debionetwork/polkadot-provider';
import { ethers } from 'ethers';
import AsyncLock from 'async-lock';

const lock = new AsyncLock();
const ESCROW_WALLET_LOCK_KEY = 'escrow-wallet-lock';

let nonce = 0;
@Injectable()
export class EscrowService {
  constructor(
    private readonly process: ProcessEnvProxy,
    private readonly substrateService: SubstrateService,
    private readonly ethereumService: EthereumService,
  ) {}
  private escrowWallet;
  private provider;

  async onModuleInit(): Promise<void> {
    this.provider = await this.ethereumService.getEthersProvider();
    this.escrowWallet = await new ethers.Wallet(
      this.process.env.DEBIO_ESCROW_PRIVATE_KEY,
      this.provider,
    );
  }

  async createOrder(request) {
    console.log('[createOrder] request: ', request);
  }

  async refundOrder(order): Promise<void> {
    console.log('[refundOrder] order: ', order);
    try {
      const provider = await this.ethereumService.getEthersProvider();
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

  async orderFulfilled(order): Promise<void> {
    let currentNonce;
    lock
      .acquire(ESCROW_WALLET_LOCK_KEY, async () => {
        const _nonce = await this.provider.getTransactionCount(
          this.escrowWallet.address,
        );
        nonce = nonce > _nonce ? nonce : _nonce;
        const feeData = await this.provider.getFeeData();
        const gasPrice = feeData.gasPrice;
        const tokenContract = this.ethereumService.getEscrowSmartContract();
        const tokenContractWithSigner = tokenContract.connect(
          this.escrowWallet,
        );
        const tx = await tokenContractWithSigner.fulfillOrder(order.id, {
          nonce,
          gasPrice,
        });
        currentNonce = nonce;
        this.provider.waitForTransaction(tx.hash).then((_tx) => {
          console.log(
            'fullfilled order customerId :',
            order.customerId,
            ' ->',
            _tx,
          );
        });
        nonce += 1;
      })
      .then(function () {
        console.log(
          `[fulfillOrder] Sent transaction for nonce: ${currentNonce}`,
        );
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  async setOrderPaidWithSubstrate(orderId: string): Promise<void> {
    try {
      await setOrderPaid(
        this.substrateService.api as any,
        this.substrateService.pair,
        orderId,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async forwardPaymentToSeller(
    sellerAddress: string,
    amount: number | string,
  ): Promise<void> {
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
