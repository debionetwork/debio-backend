import { ApiPromise } from '@polkadot/api';

export async function setGeneticAnalysisOrderPaid(
    api: ApiPromise,
    pair: any,
    geneticAnalysisOrderId,
): Promise<void> {
  await api.tx.geneticAnalysisOrders.setGeneticAnalysisOrderPaid(geneticAnalysisOrderId).signAndSend(pair, { nonce: -1 });
}

export async function setGeneticAnalysisOrderRefunded(
  api: ApiPromise,
  pair: any,
  geneticAnalysisOrderId,
): Promise<void> {
await api.tx.geneticAnalysisOrders.setGeneticAnalysisOrderRefunded(geneticAnalysisOrderId).signAndSend(pair, { nonce: -1 });
}

export async function setGeneticAnalysisOrderFulfilled(
  api: ApiPromise,
  pair: any,
  geneticAnalysisOrderId,
): Promise<void> {
await api.tx.geneticAnalysisOrders.setGeneticAnalysisOrderFulfilled(geneticAnalysisOrderId).signAndSend(pair, { nonce: -1 });
}