export * from './registered/lab-registered.command';
export * from './stake-successfull/stake-successful.command';
export * from './unstake-successfull/unstaked-successful.command';
export * from './retrieve-unstake-amount/retrieve-unstake-amount.command';

import { LabRegisteredHandler } from './registered/lab-registered.handler';
import { LabStakeSuccessfullHandler } from './stake-successfull/stake-successful.handler';
import { labUnstakedHandler } from './unstake-successfull/unstaked-successful.handler';
import { LabRetrieveUnstakeAmountHandler } from './retrieve-unstake-amount/retrieve-unstake-amount.handler';

export const LabCommandHandlers = [
  LabRegisteredHandler,
  LabStakeSuccessfullHandler,
  labUnstakedHandler,
  LabRetrieveUnstakeAmountHandler,
];
