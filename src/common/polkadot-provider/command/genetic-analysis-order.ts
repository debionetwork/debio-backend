import { ApiPromise } from '@polkadot/api';

export async function setGeneticAnalysisOrderPaid(
    api: ApiPromise,
    pair: any,
    geneticAnalysisOrderId,
  ): Promise<void> {
    await api.tx.geneticAnalysisOrders.setGeneticAnalysisOrderPaid(geneticAnalysisOrderId).signAndSend(pair, { nonce: -1 });
  }