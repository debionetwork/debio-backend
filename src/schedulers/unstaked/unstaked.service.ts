import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Interval } from '@nestjs/schedule';
import { SubstrateService } from 'src/substrate/substrate.service';

@Injectable()
export class UnstakedService implements OnModuleInit {
  private logger : Logger = new Logger(UnstakedService.name)
  private isRunning = false;
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly subtrateService: SubstrateService
  ) {}

  async onModuleInit() {
    await this.handleWaitingUnstaked();
  }

  @Interval((60 * 1000))
  async handleWaitingUnstaked() {
    try {
      this.logger.log('Retrieve Unstaked Amount');
      
      if (this.isRunning) return;

      this.isRunning = true;
      
      const createRequestService = await this.elasticsearchService.search({
        index: 'create-service-request',
        body: {
          query: {
            match: {
              'request.status': {
                query: "WaitingForUnstaked"
              }
            }
          },
          sort: [ { 'request.unstaked_at.keyword': { unmapped_type: 'keyword', order: 'asc' } } ]
        },
        from: 0,
        size: 10
      });
      
      const listRequestService = createRequestService.body.hits.hits;
  
      for (const requestService of listRequestService) {
        const timeWaitingUnstaked: string = requestService['_source']['request']['unstaked_at'];

        if (timeWaitingUnstaked) {
          const numberTimeWaitingUnstaked = Number(timeWaitingUnstaked.replace(/,/gi, ""));
          
          // const timeNext6Days = numberTimeWaitingUnstaked + (6 * 24 * 60 * 60 * 1000);
          const timeNext6Days = numberTimeWaitingUnstaked + (5 * 60 * 1000);
          const timeNow = new Date().getTime();
  
          const diffTime = timeNext6Days - timeNow;
  
          if (diffTime <= 0) {
            const requestId = requestService['_source']['request']['hash'];
            await this.subtrateService.retrieveUnstakedAmount(requestId);
          }
        }
      }
    } catch (err) {
      this.logger.error(`unstaked error ${err}`);
    } finally {
      this.isRunning = false;
    }
  }
}
