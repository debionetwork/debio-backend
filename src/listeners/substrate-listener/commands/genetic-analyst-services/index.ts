export * from './genetic-analyst-service-created/genetic-analyst-service-created.command';

import { GeneticAnalystServiceCreatedCommandHandler } from './genetic-analyst-service-created/genetic-analyst-service-created.handler';

export const GeneticAnalystServiceCommandHandler = [
  GeneticAnalystServiceCreatedCommandHandler,
];
