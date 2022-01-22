import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Interval } from '@nestjs/schedule';
import {
  queryServiceRequestById,
  retrieveUnstakedAmount,
  SubstrateService,
} from '../../common';

@Injectable()
export class UnstakedService implements OnModuleInit {
  private logger: Logger = new Logger(UnstakedService.name);
  private isRunning = false;
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly subtrateService: SubstrateService,
  ) {}

  async onModuleInit() {
    await this.handleWaitingUnstaked();
  }

  @Interval(30 * 1000)
  async handleWaitingUnstaked() {
    try {
      if (this.isRunning) return;

      this.isRunning = true;

      const createRequestService = await this.elasticsearchService.search({
        index: 'create-service-request',
        allow_no_indices: true,
        body: {
          query: {
            match: {
              'request.status': {
                query: 'WaitingForUnstaked',
              },
            },
          },
          sort: [
            {
              'request.unstaked_at.keyword': {
                unmapped_type: 'keyword',
                order: 'asc',
              },
            },
          ],
        },
        from: 0,
        size: 10,
      });
      const listRequestService = createRequestService.body.hits.hits;
      for (const requestService of listRequestService) {
        const requestId = requestService['_source']['request']['hash'];
        const serviceRequestDetail = await queryServiceRequestById(
          this.subtrateService.api,
          requestId,
        );

        if (serviceRequestDetail.status === 'Unstaked') {
          await this.elasticsearchService.update({
            index: 'create-service-request',
            id: requestId,
            refresh: 'wait_for',
            body: {
              doc: {
                request: {
                  status: serviceRequestDetail.status,
                  unstaked_at: serviceRequestDetail.unstaked_at,
                },
              },
            },
          });
        } else {
          const timeWaitingUnstaked: string =
            requestService['_source']['request']['unstaked_at'];

          if (!timeWaitingUnstaked) {
            continue;
          }

          const numberTimeWaitingUnstaked = Number(
            timeWaitingUnstaked.replace(/,/gi, ''),
          );

          const sixDays = 6 * 24 * 60 * 60 * 1000;
          const timeNext6Days = numberTimeWaitingUnstaked + sixDays;
          const timeNow = new Date().getTime();

          const diffTime = timeNext6Days - timeNow;

          if (diffTime <= 0) {
            await retrieveUnstakedAmount(
              this.subtrateService.api,
              this.subtrateService.pair,
              requestId,
            );
          }
        }
      }
    } catch (err) {
      this.logger.log(`unstaked error ${err}`);
    } finally {
      this.isRunning = false;
    }
  }
}
