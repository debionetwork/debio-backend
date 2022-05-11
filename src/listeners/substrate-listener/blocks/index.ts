export * from './commands/set-last-substrate-block/set-last-substrate-block.command';
export * from './queries/get-last-substrate-block/get-last-substrate-block.query';

import { SetLastSubstrateBlockHandler } from './commands/set-last-substrate-block/set-last-substrate-block.handler';
import { GetLastSubstrateBlockHandler } from './queries/get-last-substrate-block/get-last-substrate-block.handler';

export const BlockCommandHandlers = [SetLastSubstrateBlockHandler];

export const BlockQueryHandlers = [GetLastSubstrateBlockHandler];
