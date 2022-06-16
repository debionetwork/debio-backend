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
import { NotificationDto } from '../notification/dto/notification.dto';
import { NotificationService } from '../notification/notification.service';

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
      const notificationReward: NotificationDto = {
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

      await this.notificationService.insert(notificationReward);

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
    const currDateTime = this.dateTimeProxy.new();

    const notificationAccountVerification: NotificationDto = {
      role: 'GA',
      entity_type: 'Verification',
      entity: '',
      description: '',
      read: false,
      created_at: currDateTime,
      updated_at: currDateTime,
      deleted_at: null,
      from: 'Debio Network',
      to: accountId,
    };

    switch (verificationStatus) {
      case VerificationStatus.Verified:
        notificationAccountVerification.entity = `Account verified`;
        notificationAccountVerification.description = `Congrats! Your account has been verified.`;
        break;
      case VerificationStatus.Rejected:
        notificationAccountVerification.entity = `Account rejected`;
        notificationAccountVerification.description = `Your account verification has been rejected.`;
        break;
      case VerificationStatus.Revoked:
        notificationAccountVerification.entity = `Account revoked`;
        notificationAccountVerification.description = `Your account has been revoked.`;
        break;
    }

    if (verificationStatus !== VerificationStatus.Unverified) {
      this.notificationService.insert(notificationAccountVerification);
    }

    if (verificationStatus === VerificationStatus.Verified) {
      const notificationRewardVerified: NotificationDto = {
        role: 'GA',
        entity_type: 'Reward',
        entity: 'Account verified',
        description:
          'Congrats! You’ve received 2 DBIO from account verification.',
        read: false,
        created_at: currDateTime,
        updated_at: currDateTime,
        deleted_at: null,
        from: 'Debio Network',
        to: accountId,
      };

      this.notificationService.insert(notificationRewardVerified);
    }

    return { message: `${accountId} is ${verificationStatus}` };
  }
}
