import { LabInfo } from './lab-info';
import { LabVerificationStatus } from './lab-verification-status';

export class Lab {
  constructor(anyJson: any) {
    this.account_id = anyJson.accountId;
    this.services = anyJson.services;
    this.certifications = anyJson.certifications;
    this.verification_status = anyJson.verificationStatus;
    this.info = anyJson.info;
  }
  account_id: string;
  services: string[];
  certifications: string[];
  verification_status: LabVerificationStatus;
  info: LabInfo;
}

export * from './lab-info';
export * from './lab-verification-status';
