export * from './data-staked/data-staked.command';
export * from './dna-sample-result-ready/dna-sample-result-ready.command';
export * from './dna-sample-rejected/dna-sample-rejected.command';

import { DataStakedHandler } from './data-staked/data-staked.handler';
import { DnaSampleResultReadyCommandHandler } from './dna-sample-result-ready/dna-sample-result-ready.handler';
import { DnaSampleRejectedCommandHandler } from './dna-sample-rejected/dna-sample-rejected.handler';

export const GeneticTestingCommandHandlers = [
  DataStakedHandler,
  DnaSampleResultReadyCommandHandler,
  DnaSampleRejectedCommandHandler,
];
