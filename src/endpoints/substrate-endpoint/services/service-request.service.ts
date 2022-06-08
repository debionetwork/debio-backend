import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CountryService } from '../../location/country.service';
import { DebioConversionService } from '../../../common/modules/debio-conversion/debio-conversion.service';
import {
  RequestByCountryDictInterface,
  RequestsByCountry,
  ServiceInterface,
} from '../interface/service-request.interface';

@Injectable()
export class ServiceRequestService {
  private logger: Logger = new Logger(ServiceRequestService.name);
  constructor(
    @Inject(forwardRef(() => CountryService))
    private countryService: CountryService,
    private readonly elasticsearchService: ElasticsearchService,
    private exchangeCacheService: DebioConversionService,
  ) {}

  async getAggregatedByCountries(
    page: number,
    size: number,
  ): Promise<Array<RequestsByCountry>> {
    const requestByCountryList: Array<RequestsByCountry> = [];

    try {
      const exchangeBalance = await this.exchangeCacheService.getExchange();
      const serviceRequests = await this.elasticsearchService.search({
        index: 'country-service-request',
        body: {
          from: page ? (page - 1) * size : 0,
          size: size ? size : 10000,
          sort: [
            {
              'country.keyword': {
                unmapped_type: 'keyword',
                order: 'asc',
              },
            },
          ],
        },
      });

      const {
        body: {
          hits: { hits },
        },
      } = serviceRequests;
      const oneDbioEqualToDai = exchangeBalance?.dbioToDai || undefined;
      const oneDbioEqualToUsd = exchangeBalance?.dbioToUsd || undefined;

      // Accumulate totalRequests and totalValue by country
      const requestByCountryDict: {
        [country: string]: RequestByCountryDictInterface;
      } = {};
      for (const req of hits) {
        const {
          _source: { country, service_request },
        } = req;

        if (!requestByCountryDict[country]) {
          requestByCountryDict[country] = {
            totalRequests: 0,
            totalValue: 0,
            services: {},
          };
        }
        for (const service of service_request) {
          const serviceLocationIdentity =
            service.region + '-' + service.city + '-' + service.category;
          const value = Number(service.amount.split(',').join('')) / 10 ** 18;
          requestByCountryDict[country].totalRequests += 1;
          const currValueByCountry = Number(
            requestByCountryDict[country].totalValue,
          );
          requestByCountryDict[country].totalValue = currValueByCountry + value;

          if (
            !requestByCountryDict[country]['services'][serviceLocationIdentity]
          ) {
            requestByCountryDict[country]['services'][serviceLocationIdentity] =
              {
                category: service.category,
                regionCode: service.region,
                city: service.city,
                totalRequests: 0,
                totalValue: {
                  dbio: 0,
                  dai: 0,
                  usd: 0,
                },
              };
          }

          requestByCountryDict[country]['services'][
            serviceLocationIdentity
          ].totalRequests += 1;
          const currValueByCountryServiceCategoryDai = Number(
            requestByCountryDict[country]['services'][serviceLocationIdentity]
              .totalValue.dbio,
          );
          requestByCountryDict[country]['services'][
            serviceLocationIdentity
          ].totalValue.dbio = currValueByCountryServiceCategoryDai + value;
        }
      }

      for (const countryCode in requestByCountryDict) {
        const countryObj = await this.countryService.getByIso2Code(countryCode);
        if (!countryObj) {
          continue;
        }
        const { name } = countryObj;
        const { totalRequests, services } = requestByCountryDict[countryCode];
        const { totalValue } = requestByCountryDict[countryCode];

        const servicesArr: Array<ServiceInterface> = Object.values(
          services,
        ).map((s: any) => ({
          ...s,
          totalValue: {
            dbio: s.totalValue.dbio,
            dai: s.totalValue.dbio * oneDbioEqualToDai || 'Conversion Error',
            usd: s.totalValue.dbio * oneDbioEqualToUsd || 'Conversion Error',
          },
        }));

        const requestByCountry: RequestsByCountry = {
          country: name,
          services: servicesArr,
          totalRequests: totalRequests,
          totalValue: totalValue as string,
        };

        requestByCountryList.push(requestByCountry);
      }
    } catch (error) {
      if (error?.body?.error?.type === 'index_not_found_exception') {
        await this.logger.log(
          `API "service-requests/countries": ${error.body.error.reason}`,
        );
      } else {
        throw error;
      }
    }
    return requestByCountryList;
  }

  async getByCustomerId(customerId: string, page: number, size: number) {
    const searchObj = {
      index: 'create-service-request',
      body: {
        query: {
          bool: {
            must: [
              {
                match_phrase_prefix: {
                  'request.requester_address': { query: customerId },
                },
              },
            ],
          },
        },
      },
      from: size * page - size || 0,
      size: size || 10,
    };

    const result = [];
    try {
      const requestServiceByCustomers = await this.elasticsearchService.search(
        searchObj,
      );

      requestServiceByCustomers.body.hits.hits.forEach((requestService) => {
        result.push(requestService._source);
      });
    } catch (error) {
      if (error?.body?.error?.type === 'index_not_found_exception') {
        await this.logger.log(
          `API "service-requests/customer/{customerId}": ${error.body.error.reason}`,
        );
      } else {
        throw error;
      }
    }
    return result;
  }

  async provideRequestService(
    country: string,
    region: string,
    city: string,
    category: string,
  ) {
    const searchObj = {
      index: 'create-service-request',
      body: {
        query: {
          bool: {
            must: [
              {
                match_phrase_prefix: { 'request.country': { query: country } },
              },
              { match_phrase_prefix: { 'request.region': { query: region } } },
              { match_phrase_prefix: { 'request.city': { query: city } } },
              {
                match_phrase_prefix: {
                  'request.service_category': { query: category },
                },
              },
              { match_phrase_prefix: { 'request.status': { query: 'Open' } } },
            ],
          },
        },
      },
    };

    const result = [];
    try {
      const requestServiceByCustomers = await this.elasticsearchService.search(
        searchObj,
      );

      requestServiceByCustomers.body.hits.hits.forEach((requestService) => {
        result.push(requestService._source);
      });
    } catch (error) {
      if (error?.body?.error?.type === 'index_not_found_exception') {
        await this.logger.log(
          `API "service-requests/provideRequestService": ${error.body.error.reason}`,
        );
      } else {
        throw error;
      }
    }
    return result;
  }
}
