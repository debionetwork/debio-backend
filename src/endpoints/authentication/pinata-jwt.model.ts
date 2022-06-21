import { GoogleSecretManagerService } from '../../common';

export const pinataJwtPayload = (
  googleSecretManagerService: GoogleSecretManagerService,
) => ({
  userInformation: {
    id: googleSecretManagerService.pinataUserId,
    email: googleSecretManagerService.pinataEmail,
    email_verified: googleSecretManagerService.pinataEmailVerified,
    pin_policy: {
      regions: [
        {
          id: googleSecretManagerService.pinataPinPolicyRegionId,
          desiredReplicationCount:
            googleSecretManagerService.pinataPinPolicyRegionReplCount,
        },
      ],
      version: 1,
    },
    mfa_enabled: googleSecretManagerService.pinataMfaEnabled,
  },
  iat: Math.floor(new Date().getTime() / 1000),
});
