import { Injectable } from '@nestjs/common';
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
} from '@debionetwork/polkadot-provider';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { TransactionLoggingDto } from '../../common/modules/transaction-logging/dto/transaction-logging.dto';

@Injectable()
export class VerificationService {
  constructor(
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly subtrateService: SubstrateService,
    private readonly transactionLoggingService: TransactionLoggingService,
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
      // eslint-disable-next-line
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
        transaction_type: 8,
        transaction_status: 35,
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
}
