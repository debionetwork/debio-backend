export * from './data-staked/data-staked.command';
export * from './dna-sample-result-ready/dna-sample-result-ready.command';

import { DataStakedHandler } from './data-staked/data-staked.handler';
import { DnaSampleResultReadyCommandHandler } from './dna-sample-result-ready/dna-sample-result-ready.handler';

export const GeneticTestingCommandHandlers = [
  DataStakedHandler,
  DnaSampleResultReadyCommandHandler,
];
