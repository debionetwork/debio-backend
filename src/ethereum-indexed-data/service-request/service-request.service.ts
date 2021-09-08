import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ethers } from 'ethers';
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
        };
      }
      requestByCountryDict[request.country].totalRequests += 1;
      const currValue = ethers.BigNumber.from(
        requestByCountryDict[request.country].totalValue,
      );
      const value = ethers.BigNumber.from(
        ethers.utils.formatEther(request.staking_amount).split('.')[0],
      );
      requestByCountryDict[request.country].totalValue = currValue.add(value);
    }

    // Restructure data into array
    const requestByCountryList: Array<RequestsByCountry> = [];
    for (const countryCode in requestByCountryDict) {
      const countryObj = await this.countryService.getByIso2Code(countryCode);
      if (!countryObj) {
        continue;
      }
      const { name } = countryObj;
      const { totalRequests } = requestByCountryDict[countryCode];
      let { totalValue } = requestByCountryDict[countryCode];
      totalValue = totalValue.toString();

      const requestByCountry = {
        country: name,
        totalRequests,
        totalValue,
      };

      requestByCountryList.push(requestByCountry);
    }

    return requestByCountryList;
  }
}
