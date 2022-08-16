export interface RequestsByCountry {
  countryId: string;
  country: string;
  totalRequests: number;
  totalValue: CurrencyValueInterface;
  services: Array<ServiceInterface>;
}
export interface CurrencyValueInterface {
  dbio: number;
  dai: number | string;
  usd: number | string;
}
export interface ServiceInterface {
  countryId: string;
  category: string;
  regionCode: string;
  city: string;
  totalRequests: number;
  totalValue: CurrencyValueInterface;
}
export interface RequestByCountryDictInterface {
  totalRequests: number;
  totalValue: number;
  services: {
    [id: string]: ServiceInterface;
  };
}
