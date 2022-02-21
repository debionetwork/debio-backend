export * from './genetic-analysis-rejected/genetic-analysis-rejected.command';
export * from './genetic-analysis-resultready/genetic-analysis-result-ready.command';

import { GeneticAnalysisRejectedHandler } from './genetic-analysis-rejected/genetic-analysis-rejected.handler';
import { GeneticAnalysisResultReadyHandler } from './genetic-analysis-resultready/genetic-analysis-result-ready.handler';

export const GeneticAnalysisCommandHandlers = [
  GeneticAnalysisRejectedHandler,
  GeneticAnalysisResultReadyHandler,
];
