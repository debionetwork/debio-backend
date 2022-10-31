import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  MenstrualCycleLogErrorNotFound,
  MenstrualCycleLogInterface,
  MenstrualCycleLogResultErrorInterface,
  MenstrualCycleLogResultSuccessInterface,
} from '../interface/menstrual-cycle-log';

@Injectable()
export class MenstrualCalendarService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getMenstrualCycleLogByMonth(
    addressId: string,
    month: number,
    year: number,
  ): Promise<MenstrualCycleLogResultErrorInterface | MenstrualCycleLogResultSuccessInterface> {
    const startDateMonth: Date = new Date(year, month - 1, 1);
    const endDateMonth: Date = new Date(year, month, 0);
    console.log(addressId, month, year)
    let result: Array<MenstrualCycleLogInterface> = [];
    try {
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
            bool: {
              must: [
                {
                  match: {
                    account_id: {
                      query: addressId,
                    },
                  },
                },
                {
                  range: {
                    date: {
                      gte: startDateMonth.getTime(),
                      lte: endDateMonth.getTime(),
                    },
                  },
                }
              ]
            }
          },
        },
      });
      
      for (const hit of menstrualCycle.body.hits.hits) {
        const {_id, _source} = hit;
        
        result.push({
          id: _id,
          menstrual_calendar_id: _source.menstrual_calendar_id,
          date: _source.date,
          menstruation: _source.menstruation,
          symptoms: _source.symptoms,
          created_at: _source.created_at,
          account_id: _source.account_id,
          menstrual_calendar_cycle_log_id: _source.menstrual_calendar_cycle_log_id,
        });
      }

      if (result.length <= 0) {
        throw new MenstrualCycleLogErrorNotFound("Menstrual cycle log not found.");
      }

      return {
        status: 200,
        data: result
      };
    } catch (err: any) {
      if (err instanceof MenstrualCycleLogErrorNotFound) {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }
}
