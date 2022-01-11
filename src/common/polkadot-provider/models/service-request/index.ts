import { RequestStatus } from './request-status';

export class ServiceRequest {
  constructor(anyJson: any) {
    this.hash = anyJson.hash;
    this.requester_address = anyJson.requesterAddress;
    this.lab_address = anyJson.labAddress;
    this.country = anyJson.country;
    this.region = anyJson.region;
    this.city = anyJson.city;
    this.service_category = anyJson.serviceCategory;
    this.staking_amount = anyJson.stakingAmount;
    this.status = anyJson.status;
    this.created_at = anyJson.createdAt;
    this.updated_at = anyJson.updatedAt;
    this.unstaked_at = anyJson.unstakedAt;
  }

  hash: string;
  requester_address: string;
  lab_address: string;
  country: string;
  region: string;
  city: string;
  service_category: string;
  staking_amount: number;
  status: RequestStatus;
  created_at: Date;
  updated_at: Date;
  unstaked_at: Date;
}

export * from './request-status';
export * from './service-invoice';
