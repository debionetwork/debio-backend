import { DnaCollectionCategory } from '../../../../src/endpoints/category/dna-collection/models/dna-collection.entity';

export const dnaCollectionList: DnaCollectionCategory[] = [
  {
    id: 1,
    name: 'COVID-19',
    collectionProcess: 'SALIVA TEST',
    link: 'https://',
    created_at: new Date(),
  },
  {
    id: 2,
    name: 'BLOOD CELLS',
    collectionProcess: 'DRIED BLOOD SPOT COLLECTION PROCESS',
    link: 'https://',
    created_at: new Date(),
  },
];
