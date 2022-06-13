import { Injectable } from '@nestjs/common';
import { RewardDto } from '../../common/modules/reward/dto/reward.dto';
import { RewardService } from '../../common/modules/reward/reward.service';
import { DateTimeProxy, SubstrateService } from '../../common';
import {
  updateGeneticAnalystVerificationStatus,
  convertToDbioUnitString,
  sendRewards,
  updateLabVerificationStatus,
} from '@debionetwork/polkadot-provider';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { NotificationService } from '../notification/notification.service';
import { NotificationDto } from '../notification/dto/notification.dto';

@Injectable()
export class VerificationService {
  constructor(
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly subtrateService: SubstrateService,
    private readonly rewardService: RewardService,
    private readonly notificationService: NotificationService,
  ) {}

  async verificationLab(substrateAddress: string, verificationStatus: string) {
    const currentTime = this.dateTimeProxy.new(); // eslint-disable-line
    // Update Status Lab to Verified
    await updateLabVerificationStatus(
      this.subtrateService.api as any,
      this.subtrateService.pair,
      substrateAddress,
      <VerificationStatus>verificationStatus,
    );

    // insert notification
    const notificationInput: NotificationDto = {
      role: 'Lab',
      entity_type: 'Verification',
      entity: '',
      description: '',
      read: false,
      created_at: currentTime,
      updated_at: currentTime,
      deleted_at: null,
      from: 'Debio Network',
      to: substrateAddress,
    };

    switch (verificationStatus) {
      case VerificationStatus.Verified:
        notificationInput.entity = 'Account verified';
        notificationInput.description =
          'Congrats! Your account has been verified.';
        break;
      case VerificationStatus.Revoked:
        notificationInput.entity = 'Account revoked';
        notificationInput.description = 'Your account has been revoked.';
        break;
      case VerificationStatus.Rejected:
        notificationInput.entity = 'Account rejected';
        notificationInput.description =
          'Your account verification has been rejected.';
        break;
    }

    await this.notificationService.insert(notificationInput);

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

      // insert notification
      const notificationInput: NotificationDto = {
        role: 'Lab',
        entity_type: 'Reward',
        entity: 'Lab verified',
        description: 'Congrats! You’ve got 2 DBIO from account verification.',
        read: false,
        created_at: currentTime,
        updated_at: currentTime,
        deleted_at: null,
        from: 'Debio Network',
        to: substrateAddress,
      };

      await this.notificationService.insert(notificationInput);

      //Write to Reward Logging
      const dataInput: RewardDto = {
        address: substrateAddress,
        ref_number: '-',
        reward_amount: 2,
        reward_type: 'Lab Verified',
        currency: 'DBIO',
        created_at: new Date(this.dateTimeProxy.now()),
      };

      await this.rewardService.insert(dataInput);
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

    const gaNotificationTime = this.dateTimeProxy.new();

    const testResultNotification: NotificationDto = {
      role: 'GA',
      entity_type: 'Submit account registration and verification',
      entity: 'registration and verification',
      description: `You've successfully submitted your account verification.`,
      read: false,
      created_at: gaNotificationTime,
      updated_at: gaNotificationTime,
      deleted_at: null,
      from: 'Debio Network',
      to: accountId,
    };

    await this.notificationService.insert(testResultNotification);

    return { message: `${accountId} is ${verificationStatus}` };
  }
}
