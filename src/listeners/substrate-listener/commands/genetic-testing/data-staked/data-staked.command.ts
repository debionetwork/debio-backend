import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { DataStaked } from './data-staked.event-model';

export class DataStakedCommand {
  dataStaked: DataStaked;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.dataStaked = new DataStaked(
      data[0].toHuman(),
      data[1].toHuman(),
      data[2].toHuman(),
    );
  }
}
