import { GeneticAnalysisOrderService } from '../../../../../src/endpoints/substrate-endpoint/services';
import {
  elasticsearchServiceMockFactory,
  MockType,
  substrateServiceMockFactory,
} from '../../../mock';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { SubstrateService } from '../../../../../src/common';
import { setGeneticAnalysisOrderPaid } from '@debionetwork/polkadot-provider';

jest.mock('@debionetwork/polkadot-provider', () => ({
  setGeneticAnalysisOrderPaid: jest.fn(),
}));

describe('Substrate Indexer Genetic Analysis Service Unit Testing', () => {
  let geneticAnalysisOrderServiceMock: GeneticAnalysisOrderService;
  let substrateServiceMock: MockType<SubstrateService>;

  const API = 'API';
  const PAIR = 'PAIR';

  //Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneticAnalysisOrderService,
        {
          provide: ElasticsearchService,
          useFactory: elasticsearchServiceMockFactory,
        },
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
      ],
    }).compile();

    geneticAnalysisOrderServiceMock = module.get(GeneticAnalysisOrderService);
    substrateServiceMock = module.get(SubstrateService);
    Reflect.set(substrateServiceMock, 'api', API);
    Reflect.set(substrateServiceMock, 'pair', PAIR);

    (setGeneticAnalysisOrderPaid as jest.Mock).mockClear();
  });

  it('should be defined', () => {
    //Assert
    expect(geneticAnalysisOrderServiceMock).toBeDefined();
  });

  it('should be called genetic analysis order paid', async () => {
    const genetic_analyst_order_id = 'XX';

    await geneticAnalysisOrderServiceMock.geneticAnalysisSetOrderPaid(
      genetic_analyst_order_id,
    );

    expect(setGeneticAnalysisOrderPaid).toHaveBeenCalledTimes(1);
    expect(setGeneticAnalysisOrderPaid).toHaveBeenCalledWith(
      API,
      PAIR,
      genetic_analyst_order_id,
    );
  });
});
