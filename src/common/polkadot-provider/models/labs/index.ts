import { LabInfo } from "./lab-info";
import { LabVerificationStatus } from "./lab-verification-status";

export class Lab {
    account_id: string;
    services: string[];
    certifications: string[];
    verification_status: LabVerificationStatus;
    info: LabInfo;
}