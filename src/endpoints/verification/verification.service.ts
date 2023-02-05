import { HttpException, Injectable } from '@nestjs/common';
import {
  DateTimeProxy,
  SubstrateService,
  TransactionLoggingService,
} from '../../common';
import {
  updateGeneticAnalystVerificationStatus,
  convertToDbioUnitString,
  sendRewards,
  updateLabVerificationStatus,
  updateVerificationStatusHealthProfessional,
} from '@debionetwork/polkadot-provider';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { TransactionLoggingDto } from '../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { TransactionTypeList } from '../../common/modules/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '../../common/modules/transaction-status/models/transaction-status.list';
import { InjectRepository } from '@nestjs/typeorm';
import { MyriadAccount } from '../myriad/models/myriad-account.entity';
import { Repository } from 'typeorm';
import { MyriadService } from '@endpoints/myriad/myriad.service';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(MyriadAccount)
    private readonly myriadAccountRepository: Repository<MyriadAccount>,
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly subtrateService: SubstrateService,
    private readonly transactionLoggingService: TransactionLoggingService,
    private readonly myriadService: MyriadService,
  ) {}

  async verificationLab(substrateAddress: string, verificationStatus: string) {
    // Update Status Lab to Verified
    await updateLabVerificationStatus(
      this.subtrateService.api as any,
      this.subtrateService.pair,
      substrateAddress,
      <VerificationStatus>verificationStatus,
    );

    //Send Reward 2 DBIO
    if (verificationStatus === 'Verified') {
      const reward = 2;
      await sendRewards(
        this.subtrateService.api as any,
        this.subtrateService.pair,
        substrateAddress,
        convertToDbioUnitString(reward),
      );

      //Write to Reward Logging
      const dataInput: TransactionLoggingDto = {
        address: substrateAddress,
        amount: 2,
        created_at: new Date(this.dateTimeProxy.now()),
        currency: 'DBIO',
        parent_id: BigInt(0),
        ref_number: '-',
        transaction_type: TransactionTypeList.Reward,
        transaction_status: TransactionStatusList.LabVerified,
      };

      await this.transactionLoggingService.create(dataInput);
    }
  }

  async verificationGeneticAnalyst(
    accountId: string,
    verificationStatus: string,
  ) {
    await updateGeneticAnalystVerificationStatus(
      this.subtrateService.api as any,
      this.subtrateService.pair,
      accountId,
      <VerificationStatus>verificationStatus,
    );

    return { message: `${accountId} is ${verificationStatus}` };
  }

  async verificationHealthProfessional(
    accountId: string,
    hexAccountId: string,
    verificationStatus: VerificationStatus,
    myriadUserId: string[],
    timelineId: string,
  ) {
    console.log(accountId, hexAccountId, verificationStatus, myriadUserId, timelineId);
    const hexRe = /^0x[A-F0-9]+$/i;

    if (!hexRe.test(hexAccountId)) {
      throw new HttpException({
        status: 422,
        message: "hex account id must hexdecimal"
      }, 422);
    }

    await updateVerificationStatusHealthProfessional(
      this.subtrateService.api as any,
      this.subtrateService.pair,
      accountId,
      verificationStatus,
    );

    if (verificationStatus === VerificationStatus.Verified) {
      const myriad = await this.myriadAccountRepository.findOne({
        select: ['address', 'role'],
        where: {
          address: hexAccountId,
        },
      });

      await this.myriadAccountRepository.update(
        {
          address: myriad.address,
        },
        {
          role: myriad.role.replace('unverified/', ''),
        },
      );

      await this.myriadService.customVisibilityTimeline(myriadUserId, timelineId);
    }
  }
}
