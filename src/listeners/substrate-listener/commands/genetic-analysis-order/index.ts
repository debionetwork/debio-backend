export * from './genetic-analysis-order-paid/genetic-analysis-order-paid.command';
export * from './genetic-analysys-order-created/genetic-analysis-order-created.command';
export * from './genetic-analysis-order-refunded/genetic-analysis-order-refunded.command';
export * from './genetic-analysis-order-fulfilled/genetic-analysis-order-fulfilled.command';

import { GeneticAnalysisOrderFulfilledHandler } from './genetic-analysis-order-fulfilled/genetic-analysis-order-fulfilled.handler';
import { GeneticAnalysisOrderPaidHandler } from './genetic-analysis-order-paid/genetic-analysis-order-paid.handler';
import { GeneticAnalysisOrderRefundedHandler } from './genetic-analysis-order-refunded/genetic-analysis-order-refunded.handler';
import { GeneticAnalysisOrderCreatedHandler } from './genetic-analysys-order-created/genetic-analysis-order-created.handler';

export const GeneticAnalysisOrderCommandHandlers = [
  GeneticAnalysisOrderPaidHandler,
  GeneticAnalysisOrderCreatedHandler,
  GeneticAnalysisOrderRefundedHandler,
  GeneticAnalysisOrderFulfilledHandler,
];
