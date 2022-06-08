import { DnaSample } from '@debionetwork/polkadot-provider/lib/models/labs/genetic-testing/dna-sample';
import { BlockMetaData } from '../../../models/block-metadata.event-model';

export class DnaSampleResultReadyCommand {
  dnaSample: DnaSample;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const dnaSampleData = data[0];
    this.dnaSample = new DnaSample(dnaSampleData.toHuman());
  }
}
