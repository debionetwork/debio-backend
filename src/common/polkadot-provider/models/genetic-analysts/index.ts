import { convertSubstrateBalanceToNumber } from '../..';
import { GeneticAnalystInfo } from './genetic-analyst-info';
import { GeneticAnalystsVerificationStatus } from './genetic-analyst-verification-status';

export class GeneticAnalyst {
  constructor(anyJson: any) {
    this.account_id = anyJson.accountId;
    this.services = anyJson.services;
    this.qualifications = anyJson.qualifications;
    this.info = anyJson.info;
    this.stake_amount = anyJson.stakeAmount;
    this.verification_status = anyJson.verificationStatus
  }
  account_id: string;
  services: string[];
  qualifications: string[];
  verification_status: GeneticAnalystsVerificationStatus;
  info: GeneticAnalystInfo;
  stake_amount: number;
  
  humanToGeneticAnalystListenerData() {
    const geneticAnalyst : GeneticAnalyst = this; // eslint-disable-line
    
    geneticAnalyst.stake_amount = convertSubstrateBalanceToNumber(geneticAnalyst.stake_amount)
    return geneticAnalyst;
  }
}

export * from './genetic-analyst-info';
export * from './genetic-analyst-verification-status';
