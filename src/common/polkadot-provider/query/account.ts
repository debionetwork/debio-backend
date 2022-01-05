import { ApiPromise } from '@polkadot/api';

export async function queryAccountBalance(api: ApiPromise, accountId: string): Promise<Number> {
    const { data: balance } = await this.api.query.system.account(accountId);
    const chainDecimal = this.api.registry.chainDecimals;
    return Number(balance.free.toBigInt()) / Math.pow(10, chainDecimal[0]);
}