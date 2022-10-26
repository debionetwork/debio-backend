import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class MenstrualCalendarService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getMenstrualCycleLogByMonth(
    addressId: string,
    month: number,
    year: number,
  ) {
    const startDateMonth: Date = new Date(year, month - 1, 1);
    const endDateMonth: Date = new Date(year, month, 0);

    const menstrualCycle = await this.elasticsearchService.search({
      index: 'menstrual-cycle-log',
      body: {
        from: 0,
        size: 100,
        sort: [
          {
            'date.keyword': {
              unmapped_type: 'keyword',
              order: 'asc',
            },
          },
        ],
        query: {
          match: {
            address_id: {
              query: addressId,
            },
          },
          range: {
            date: {
              gte: startDateMonth.getTime(),
              lte: endDateMonth.getTime(),
            },
          },
        },
      },
    });

    return menstrualCycle.body.hits.hits;
  }
}
