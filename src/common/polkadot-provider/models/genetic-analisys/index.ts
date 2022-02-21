import { convertSubstrateNumberToNumber } from '../../';
import { GeneticAnalysisStatus } from './genetic-analysis-status';

export class GeneticAnalysis {
  constructor(anyJson: any) {
    this.genetic_analysis_tracking_id = anyJson.geneticAnalysisTrackingId;
    this.genetic_analystId = anyJson.geneticAnalystId;
    this.owner_id = anyJson.ownerId;
    this.report_link = anyJson.reportLink;
    this.comment = anyJson.comment;
    this.rejected_title = anyJson.rejectedTitle;
    this.rejected_description = anyJson.rejectedDescription;
    this.genetic_analysis_orderId = anyJson.geneticAnalysisOrderId;
    this.created_at = anyJson.createdAt;
    this.updated_at = anyJson.updatedAt;
    this.status = anyJson.status;
  }

  genetic_analysis_tracking_id: string;
  genetic_analystId: string;
  owner_id: string;
  report_link: string;
  comment: string;
  rejected_title: string;
  rejected_description: string;
  genetic_analysis_orderId: string;
  created_at: Date;
  updated_at: Date;
  status: GeneticAnalysisStatus;

  humanToGeneticAnalysisListenerData() {
    const geneticAnalysis : GeneticAnalysis = this; // eslint-disable-line

    geneticAnalysis.created_at = new Date(
      convertSubstrateNumberToNumber(geneticAnalysis.created_at),
    );

    if (geneticAnalysis.updated_at) {
      geneticAnalysis.updated_at = new Date(
        convertSubstrateNumberToNumber(geneticAnalysis.updated_at),
      );
    }

    return geneticAnalysis;
  }
}

export * from './genetic-analysis-status';
