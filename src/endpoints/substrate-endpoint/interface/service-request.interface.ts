export interface RequestsByCountry {
  country: string;
  totalRequests: number;
  totalValue: string;
  services: Array<ServiceInterface>;
}
export interface CurrencyValueInterface {
  dbio: number;
  dai: number;
  usd: number;
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
  totalValue: string | number;
  services: {
    [id: string]: ServiceInterface;
  };
}
