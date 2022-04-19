import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ProcessEnvProxy, SubstrateService } from '../../common';
import {
  queryLabById,
  retrieveLabUnstakeAmount,
} from '@debionetwork/polkadot-provider';

@Injectable()
export class LabUnstakedService implements OnModuleInit {
  private logger: Logger = new Logger(LabUnstakedService.name);
  private isRunning = false;
  private timer: number;
  constructor(
    private readonly processEnvProxy: ProcessEnvProxy,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly subtrateService: SubstrateService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    this.timer = this.strToMilisecond(this.processEnvProxy.env.UNSTAKE_TIMER);
    const unstakeInterval: number = this.strToMilisecond(
      this.processEnvProxy.env.UNSTAKE_INTERVAL,
    );

    const unstaked = setInterval(async () => {
      await this.handleWaitingLabUnstaked();
    }, unstakeInterval);
    this.schedulerRegistry.addInterval('lab-unstaked-interval', unstaked);
  }

  async handleWaitingLabUnstaked() {
    try {
      if (this.isRunning) return;

      this.isRunning = true;
      const createRequestService = await this.elasticsearchService.search({
        index: 'labs',
        allow_no_indices: true,
        body: {
          query: {
            match: {
              'stake_status': {
                query: 'WaitingForUnstaked',
              },
            },
          },
          sort: [
            {
              'unstake_at.keyword': {
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
        const requestId = requestService['_source']['account_id'];
        const serviceRequestDetail = await queryLabById(
          this.subtrateService.api as any,
          requestId,
        );

        if (serviceRequestDetail.stakeStatus === 'Unstaked') {
          await this.elasticsearchService.update({
            index: 'labs',
            id: requestId,
            refresh: 'wait_for',
            body: {
              doc: {
                status: serviceRequestDetail.stakeStatus,
                unstaked_at: serviceRequestDetail.unstakeAt,
              },
            },
          });
        } else {
          const timeWaitingUnstaked: string =
            requestService['_source']['unstaked_at'];

          if (!timeWaitingUnstaked) {
            continue;
          }

          const numberTimeWaitingUnstaked = Number(
            timeWaitingUnstaked.replace(/,/gi, ''),
          );

          const timeNext6Days = numberTimeWaitingUnstaked + this.timer;
          const timeNow = new Date().getTime();
          const diffTime = timeNext6Days - timeNow;

          if (diffTime <= 0) {
            await retrieveLabUnstakeAmount(
              this.subtrateService.api as any,
              this.subtrateService.pair,
              requestId,
            );
          }
        }
      }
    } catch (err) {
      this.logger.error(`lab unstaked error ${err}`);
    } finally {
      this.isRunning = false;
    }
  }

  strToMilisecond(timeFormat: string): number {
    // time format must DD:HH:MM:SS
    const splitTimeFormat = timeFormat.split(':');

    const d = Number(splitTimeFormat[0]);
    const h = Number(splitTimeFormat[1]);
    const m = Number(splitTimeFormat[2]);
    const s = Number(splitTimeFormat[3]);

    const dayToMilisecond = d * 24 * 60 * 60 * 1000;
    const hourToMilisecond = h * 60 * 60 * 1000;
    const minuteToMilisecond = m * 60 * 1000;
    const secondToMilisecond = s * 1000;

    const result =
      dayToMilisecond +
      hourToMilisecond +
      minuteToMilisecond +
      secondToMilisecond;

    return result;
  }
}