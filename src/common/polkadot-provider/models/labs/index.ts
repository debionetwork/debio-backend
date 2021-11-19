import { LabInfo } from './lab-info';
import { LabVerificationStatus } from './lab-verification-status';

export class Lab {
  constructor(anyJson: any) {
    this.account_id = anyJson.account_id;
    this.services = anyJson.services;
    this.certifications = anyJson.certifications;
    this.verification_status = anyJson.verification_status;
    this.info = anyJson.info;
  }
  account_id: string;
  services: string[];
  certifications: string[];
  verification_status: LabVerificationStatus;
  info: LabInfo;
}
