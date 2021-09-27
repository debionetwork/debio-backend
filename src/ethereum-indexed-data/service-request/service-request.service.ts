import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ethers } from 'ethers';
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

      if (!requestByCountryDict[request.country]) {
        requestByCountryDict[request.country] = {
          totalRequests: 0,
          totalValue: 0,
          services: {},
        };
      }

      const value = ethers.BigNumber.from(
        ethers.utils.formatEther(request.staking_amount).split('.')[0],
      );

      requestByCountryDict[request.country].totalRequests += 1;
      const currValueByCountry = ethers.BigNumber.from(
        requestByCountryDict[request.country].totalValue,
      );
      requestByCountryDict[request.country].totalValue =
        currValueByCountry.add(value);

        if (
          !requestByCountryDict[request.country]['services'][
            request.city+'-'+request.service_category
          ]
          ) {
            requestByCountryDict[request.country]['services'][
              request.city+'-'+request.service_category
            ] = {
              name: request.service_category,
              city: request.city,
              totalRequests: 0,
              totalValue: {
                dai: 0,
                usd: 0,
              },
            };
          }

      requestByCountryDict[request.country]['services'][
        request.city+'-'+request.service_category
      ].totalRequests += 1;
      const currValueByCountryServiceCategoryDai = ethers.BigNumber.from(
        requestByCountryDict[request.country]['services'][
          request.city+'-'+request.service_category
        ].totalValue.dai,
      );
      requestByCountryDict[request.country]['services'][
        request.city+'-'+request.service_category
      ].totalValue.dai = currValueByCountryServiceCategoryDai.add(value);
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
      totalValue = totalValue.toString();

      const servicesArr = Object.values(services).map((s: any) => ({
        ...s,
        totalValue: {
          dai: s.totalValue.dai.toString(),
          usd: (Number(s.totalValue.dai.toString()) * oneDaiEqualToUsd.price).toString(),
        },
      }));

      const requestByCountry = {
        country: name,
        totalRequests,
        totalValue,
        services: servicesArr,
      };

      requestByCountryList.push(requestByCountry);
    }

    return requestByCountryList;
  }
}
