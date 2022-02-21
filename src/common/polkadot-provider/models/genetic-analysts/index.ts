import { GeneticAnalystInfo } from './genetic-analyst-info';
import { GeneticAnalystsVerificationStatus } from './genetic-analyst-verification-status';

export class GeneticAnalyst {
  constructor(anyJson: any) {
    this.account_id = anyJson.accountId;
    this.services = anyJson.services;
    this.qualifications = anyJson.qualifications;
    this.info = anyJson.info;
  }
  account_id: string;
  services: string[];
  qualifications: string[];
  verification_status: GeneticAnalystsVerificationStatus;
  info: GeneticAnalystInfo;
}

export * from './genetic-analyst-info';
export * from './genetic-analyst-verification-status';
