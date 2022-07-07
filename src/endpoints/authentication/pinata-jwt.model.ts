export const pinataJwtPayload = {
  userInformation: {
    id: process.env.PINATA_USER_ID,
    email: process.env.PINATA_EMAIL,
    email_verified: process.env.PINATA_EMAIL_VERIFIED,
    pin_policy: {
      regions: [
        {
          id: process.env.PINATA_PIN_POLICY_REGION_ID,
          desiredReplicationCount:
            process.env.PINATA_PIN_POLICY_REGION_REPL_COUNT,
        },
      ],
      version: 1,
    },
    mfa_enabled: process.env.PINATA_MFA_ENABLED,
  },
  iat: Math.floor(new Date().getTime() / 1000),
};
