export * from "./data-staked/data-staked.command";

import { DataStakedHandler } from "./data-staked/data-staked.handler";

export const GeneticTestingCommandHandlers = [
  DataStakedHandler
]