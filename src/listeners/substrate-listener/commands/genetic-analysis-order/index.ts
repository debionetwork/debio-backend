export * from './genetic-analysis-order-paid/genetic-analysis-order-paid.command';

import { GeneticAnalysisOrderPaidHandler } from './genetic-analysis-order-paid/genetic-analysis-order-paid.handler';

export const GeneticAnalysisOrderCommandHandlers = [
  GeneticAnalysisOrderPaidHandler,
]