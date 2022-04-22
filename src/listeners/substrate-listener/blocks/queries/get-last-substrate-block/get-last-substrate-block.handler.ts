import { Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GetLastSubstrateBlockQuery } from './get-last-substrate-block.query';

@Injectable()
@QueryHandler(GetLastSubstrateBlockQuery)
export class GetLastSubstrateBlockHandler
  implements IQueryHandler<GetLastSubstrateBlockQuery>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute() {
    const { body } = await this.elasticsearchService.search({
      index: 'last-block-number-backend',
      allow_no_indices: true,
    });
    if (body.hits.hits[0]) {
      return body.hits.hits[0]._source.last_block_number;
    } else {
      return null;
    }
  }
}
