import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SetLastSubstrateBlockCommand } from './set-last-substrate-block.command';

@Injectable()
@CommandHandler(SetLastSubstrateBlockCommand)
export class SetLastSubstrateBlockHandler
  implements ICommandHandler<SetLastSubstrateBlockCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: SetLastSubstrateBlockCommand) {
    await this.elasticsearchService.index({
      index: 'last-block-number-backend',
      id: 'last-block-number-backend',
      refresh: 'wait_for',
      body: {
        last_block_number: command.blockNumber,
      },
    });
  }
}
