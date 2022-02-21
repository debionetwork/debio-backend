export * from './query';
export * from './models';
export * from './command';

export function convertSubstrateNumberToNumber(data: any): number {
  return Number(data.toString().split(',').join(''));
}

export function convertSubstrateBalanceToNumber(bal: any): number {
  return convertSubstrateNumberToNumber(bal) / 10 ** 18;
}
