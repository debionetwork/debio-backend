import { Service } from '../../../../../common/polkadot-provider/models';
import { BlockMetaData } from '../../../models/block-metadata.event-model';

export class ServiceCreatedCommand {
  services: Service;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const serviceData = data[0];
    this.services = new Service(serviceData.toHuman());
  }
}
