import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ethers } from 'ethers';
import { StateService } from 'src/location/state.service';
import { EthereumService } from '../../ethereum/ethereum.service';
import { CountryService } from '../../location/country.service';

interface RequestsByCountry {
  country: string;
  totalRequests: number;
  totalValue: string;
}

@Injectable()
export class ServiceRequestService {
  constructor(
    @Inject(forwardRef(() => CountryService))
    private countryService: CountryService,
    @Inject(forwardRef(() => StateService))
    private stateService: StateService,
    private readonly elasticsearchService: ElasticsearchService,
    @Inject(forwardRef(() => EthereumService))
    private ethereumService: EthereumService,
  ) {}

  async getAggregatedByCountries(): Promise<Array<RequestsByCountry>> {
    const serviceRequests = await this.elasticsearchService.search({
      index: 'create-service-request',
      body: { from: 0, size: 1000 },
    });
    const {
      body: {
        hits: { hits },
      },
    } = serviceRequests;
    const oneDaiEqualToUsd = await this.ethereumService.convertCurrency('DAI', 'USD', 1)
    
    // Accumulate totalRequests and totalValue by country
    const requestByCountryDict = {};
    for (const req of hits) {
      const {
        _source: { request },
      } = req;

      if (!requestByCountryDict[request.country] && request.status === 'Open') {
        requestByCountryDict[request.country] = {
          totalRequests: 0,
          totalValue: 0,
          services: {},
        };
      }

      const value = Number(request.staking_amount) / 10**18;
      requestByCountryDict[request.country].totalRequests += 1;
      const currValueByCountry = Number(
        requestByCountryDict[request.country].totalValue,
      );
      requestByCountryDict[request.country].totalValue =
        currValueByCountry+value;

        if (
          !requestByCountryDict[request.country]['services'][
            request.region+'-'+request.city+'-'+request.service_category
          ] && request.status === 'Open'
          ) {
            requestByCountryDict[request.country]['services'][
              request.region+'-'+request.city+'-'+request.service_category
            ] = {
              category: request.service_category,
              regionCode: request.region,
              city: request.city,
              totalRequests: 0,
              totalValue: {
                dai: 0,
                usd: 0,
              },
            };
          }

      requestByCountryDict[request.country]['services'][
        request.region+'-'+request.city+'-'+request.service_category
      ].totalRequests += 1;
      const currValueByCountryServiceCategoryDai = Number(
        requestByCountryDict[request.country]['services'][
          request.region+'-'+request.city+'-'+request.service_category
        ].totalValue.dai,
      );
      
      requestByCountryDict[request.country]['services'][
        request.region+'-'+request.city+'-'+request.service_category
      ].totalValue.dai = currValueByCountryServiceCategoryDai + value;
    }

    // Restructure data into array
    
    const requestByCountryList: Array<RequestsByCountry> = [];
    for (const countryCode in requestByCountryDict) {
      const countryObj = await this.countryService.getByIso2Code(countryCode);
      if (!countryObj) {
        continue;
      }
      const { name } = countryObj;
      const { totalRequests, services } = requestByCountryDict[countryCode];
      let { totalValue } = requestByCountryDict[countryCode];
      totalValue = totalValue;

      const servicesArr = Object.values(services).map((s: any) => ({
        ...s,
        totalValue: {
          dai: s.totalValue.dai,
          usd: (s.totalValue.dai * oneDaiEqualToUsd.price),
        },
      }));

      const requestByCountry = {
        countryId: countryCode,
        country: name,
        totalRequests,
        totalValue,
        services: servicesArr,
      };

      requestByCountryList.push(requestByCountry);
    }
    return requestByCountryList;
  }

  async getByCustomerId(
    customerId: string,
    page: number,
    size: number
    ) {
    const searchObj = {
      index: 'create-service-request',
      body: {
        query: {
          bool: {
            must: [
              { match_phrase_prefix: { 'request.requester_address': { query: customerId } } },
            ],
          },
        },
      },
      from: 0,
      size: 10,
    };

    if (page || size) {
      const _size = size ? size : 10;
      const from = size * page - _size;

      searchObj.from = from;
      searchObj.size = _size;
    }

    const result = []
    const requestServiceByCustomers = await this.elasticsearchService.search(searchObj)

    requestServiceByCustomers.body.hits.hits.forEach(requestService => {
      result.push(requestService._source)
    });
    return result
  }

    async provideRequestService(
    country: string,
    region: string,
    city: string,
    category: string,
    page: number,
    size: number
    ) {
    const searchObj = {
      index: 'create-service-request',
      body: {
        query: {
          bool: {
            must: [
              { match_phrase_prefix: { 'request.country': { query: country } } },
              { match_phrase_prefix: { 'request.region': { query: region } } },
              { match_phrase_prefix: { 'request.city': { query: city } } },
              { match_phrase_prefix: { 'request.service_category': { query: category } } },
              { match_phrase_prefix: { 'request.status': { query: "Open" } } },
            ],
          },
        },
      },
      from: 0,
      size: 10,
    };

    if (page || size) {
      const _size = size ? size : 10;
      const from = size * page - _size;

      searchObj.from = from;
      searchObj.size = _size;
    }

    const result = []
    const requestServiceByCustomers = await this.elasticsearchService.search(searchObj)

    requestServiceByCustomers.body.hits.hits.forEach(requestService => {
      result.push(requestService._source)
    });
    return result
  }
}
