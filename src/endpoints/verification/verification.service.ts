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
import { TransactionTypeList } from '../../common/modules/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '../../common/modules/transaction-status/models/transaction-status.list';

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
}
