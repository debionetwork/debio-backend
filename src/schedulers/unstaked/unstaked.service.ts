import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Interval } from '@nestjs/schedule';
import { SubstrateService } from 'src/substrate/substrate.service';

@Injectable()
export class UnstakedService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly subtrateService: SubstrateService
  ) {}

  @Interval(1000)
  async handleWaitingUnstaked() {
    const create_request_service = await this.elasticsearchService.search({
      index: 'create-service-request',
      body: {
        query: {
          match: {
            'request.status': {
              query: "WaitingForUnstaked"
            }
          }
        },
        sort: [
          {
            'request.unstaked_at': {
              unmapped_type: 'keyword',
              order: 'asc'
            }
          }
        ]
      },
      from: 0,
      size: 10
    });

    const list_request_service = create_request_service.body.hits.hits;

    for (const request_service of list_request_service) {
      const timeWaitingUnstaked: string = request_service['request']['unstaked_at'];
      if (timeWaitingUnstaked) {
        const numberTimeWaitingUnstaked: number = Number(timeWaitingUnstaked.replace(/,/gi, ""));
        
        const timeNext6Days = numberTimeWaitingUnstaked + (6 * 24 * 60 * 60 * 1000);
        const timeNow = new Date().getTime();

        const diffTime = timeNext6Days - timeNow;

        if (diffTime <= 0) {
          await this.subtrateService.retrieveUnstakedAmount(request_service['request']);
        }
      }
    }
  }
}
