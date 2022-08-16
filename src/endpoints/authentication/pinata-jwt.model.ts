import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { keyList } from '../../secrets';

export const pinataJwtPayload = (
  gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
) => ({
  userInformation: {
    id: gCloudSecretManagerService.getSecret('PINATA_USER_ID').toString(),
    email: gCloudSecretManagerService.getSecret('PINATA_EMAIL').toString(),
    email_verified: gCloudSecretManagerService
      .getSecret('PINATA_EMAIL_VERIFIED')
      .toString(),
    pin_policy: {
      regions: [
        {
          id: gCloudSecretManagerService
            .getSecret('PINATA_PIN_POLICY_REGION_ID')
            .toString(),
          desiredReplicationCount: gCloudSecretManagerService
            .getSecret('PINATA_PIN_POLICY_REGION_REPL_COUNT')
            .toString(),
        },
      ],
      version: 1,
    },
    mfa_enabled: gCloudSecretManagerService
      .getSecret('PINATA_MFA_ENABLED')
      .toString(),
  },
  iat: Math.floor(new Date().getTime() / 1000),
});
