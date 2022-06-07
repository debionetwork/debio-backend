export * from './service-request-created/service-request-created.command';
export * from './service-request-processed/service-request-processed.command';
export * from './service-request-unstaked/service-request-unstaked.command';
export * from './service-request-waiting-for-unstaked/service-request-waiting-for-unstaked.command';
export * from './service-request-excess/service-request-excess.command';
export * from './service-request-partial/service-request-partial.command';

import { ServiceRequestCreatedHandler } from './service-request-created/service-request-created.handler';
import { ServiceRequestProcessedHandler } from './service-request-processed/service-request-processed.handler';
import { ServiceRequestUnstakedHandler } from './service-request-unstaked/service-request-unstaked.handler';
import { ServiceRequestWaitingForUnstakedHandler } from './service-request-waiting-for-unstaked/service-request-waiting-for-unstaked.handler';
import { ServiceRequestStakingAmountIncreasedHandler } from './service-request-partial/service-request-partial.handler';
import { ServiceRequestStakingAmountExcessRefunded } from './service-request-excess/service-request-excess.handler';

export const ServiceRequestCommandHandlers = [
  ServiceRequestCreatedHandler,
  ServiceRequestProcessedHandler,
  ServiceRequestUnstakedHandler,
  ServiceRequestWaitingForUnstakedHandler,
  ServiceRequestStakingAmountIncreasedHandler,
  ServiceRequestStakingAmountExcessRefunded,
];
