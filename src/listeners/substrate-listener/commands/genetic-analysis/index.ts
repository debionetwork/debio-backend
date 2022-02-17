export * from './genetic-analysis-rejected/genetic-analysis-rejected.command';

import { GeneticAnalysisRejectedHandler} from './genetic-analysis-rejected/genetic-analysis-rejected.handler';

export const GeneticAnalysisCommandHandlers = [
  GeneticAnalysisRejectedHandler,
]