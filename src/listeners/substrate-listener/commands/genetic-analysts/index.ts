export * from './genetic-analyst-staked/genetic-analyst-staked.command';
export * from './genetic-analyst-verification-status/genetic-analyst-verification-status.command';

import { GeneticAnalystStakedHandler } from './genetic-analyst-staked/genetic-analyst-staked.handler';
import { GeneticAnalystVerificationStatusHandler } from './genetic-analyst-verification-status/genetic-analyst-verification-status.handler';

export const GeneticAnalystCommandHandlers = [
  GeneticAnalystStakedHandler,
  GeneticAnalystVerificationStatusHandler,
];
