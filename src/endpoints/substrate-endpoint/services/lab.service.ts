import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { StateService } from '../../location/state.service';
import { CountryService } from '../../location/country.service';

@Injectable()
export class LabService {
  private readonly logger: Logger = new Logger(LabService.name);
  constructor(
    @Inject(forwardRef(() => CountryService))
    private countryService: CountryService,
    @Inject(forwardRef(() => StateService))
    private stateService: StateService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async getByCountryCityCategory(
    country: string,
    region: string,
    city: string,
    category: string,
    page: number,
    size: number,
  ) {
    let result = [];
    try {
      const searchMustList: Array<any> = [
        {
          match_phrase_prefix: { 'info.country': { query: country } },
        },
      ];

      if (region !== undefined && region !== null && region.trim() !== '') {
        searchMustList.push({
          match_phrase_prefix: { 'info.region': { query: region } },
        });
      }

      if (city !== undefined && city !== null && city.trim() !== '') {
        searchMustList.push({
          match_phrase_prefix: { 'info.city': { query: city } },
        });
      }

      const countryName =
        (await this.countryService.getByIso2Code(country))?.name ?? '';
      const regionMap: Map<string, string> = new Map<string, string>();

      const searchObj = {
        index: 'labs',
        body: {
          query: {
            bool: {
              must: searchMustList,
            },
          },
        },
        from: (size * page - size) | 0,
        size: size | 10,
      };

      const labs = await this.elasticsearchService.search(searchObj);
      for (const lab of labs.body.hits.hits) {
        let { services } = lab._source;
        const { info } = lab._source;
        if (
          category !== undefined &&
          category !== null &&
          category.trim() !== ''
        ) {
          services = services.filter(
            (serviceFilter) => serviceFilter.info['category'] === category,
          );
        }

        let regionName = '';

        if (regionMap.has(info.region)) {
          regionName = regionMap.get(info.region);
        } else {
          regionName = (await this.stateService.getState(country, info.region))
            .name;
          regionMap.set(info.region, regionName);
        }

        result = services.map((labService) => {
          labService.lab_detail = lab._source.info;
          labService.certifications = lab._source.certifications;
          labService.verification_status = lab._source.verification_status;
          labService.blockMetaData = lab._source.blockMetaData;
          labService.stake_amount = lab._source.stake_amount;
          labService.stake_status = lab._source.stake_status;
          labService.unstake_at = lab._source.unstake_at;
          labService.retrieve_unstake_at = lab._source.retrieve_unstake_at;
          labService.lab_id = lab._source.account_id;
          labService.country_name = countryName;
          labService.region_name = regionName;

          return labService;
        });
      }

      return { result };
    } catch (error) {
      if (error?.body?.error?.type === 'index_not_found_exception') {
        await this.logger.log(`API "labs": ${error.body.error.reason}`);
        return { result };
      }

      throw error;
    }
  }
}
