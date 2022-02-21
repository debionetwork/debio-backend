export * from './genetic-analyst-staked/genetic-analyst-staked.command';

import { GeneticAnalystStakedHandler } from './genetic-analyst-staked/genetic-analyst-staked.handler';

export const GeneticAnalystCommandHandlers = [
  GeneticAnalystStakedHandler,
]