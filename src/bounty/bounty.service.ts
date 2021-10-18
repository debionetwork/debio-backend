import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { DataBounty } from './models/bounty.entity';
import { ethers } from 'ethers';
import { EscrowService } from '../escrow/escrow.service';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import spec from '../substrate/substrateTypes.json';

@Injectable()
export class BountyService {
  private api: ApiPromise;
  private escrowWallet: any;
  constructor(
    @Inject(forwardRef(() => EscrowService))
    private escrowService: EscrowService,
    @InjectRepository(DataBounty)
    private readonly dataBountyRepository: Repository<DataBounty>,
  ) {}

  async onModuleInit() {
    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL);
    this.api = await ApiPromise.create({
      provider: wsProvider,
      types: spec,
    });
    const keyring = new Keyring({ type: 'sr25519' });
    this.escrowWallet = await keyring.addFromUri(
      process.env.ESCROW_SUBSTRATE_MNEMONIC,
    );
  }

  create(data: CreateBountyDto) {
    const data_bounty = new DataBounty();
    data_bounty.hash_bounty_ocean = ethers.utils.sha256(ethers.utils.toUtf8Bytes(data.bounty_ocean));
    return this.dataBountyRepository.save(data_bounty);
  }

  async submitStaking(hash: String) {
    const wallet = this.escrowWallet;
    const response = await this.api.tx.orders
      .submitDataStakingDetails(hash)
      .signAndSend(wallet, {
        nonce: -1,
      });
    console.log(response);
  }
}
