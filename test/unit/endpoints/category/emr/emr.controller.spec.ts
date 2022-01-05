import { Test, TestingModule } from '@nestjs/testing';
import { EmrController } from '../../../../../src/endpoints/category/emr/emr.controller';
import { EmrService } from '../../../../../src/endpoints/category/emr/emr.service';
import { MockType } from '../../../mock';

describe('Emr Controller Unit Tests', () => {
  const emrServiceMockFactory: () => MockType<EmrService> = jest.fn(() => ({
    getAll: jest.fn(entity => entity),
  }));

  let emrController: EmrController;
  let emrServiceMock: MockType<EmrService>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmrController,
        { provide: EmrService, useFactory: emrServiceMockFactory },
      ],
    }).compile();
    emrController = module.get(EmrController);
    emrServiceMock = module.get(EmrService);
  });

  it('should be defined', () => {
    // Assert
    expect(emrController).toBeDefined();
  });

  it('should find all categories', () => {
    // Arrange
    const categories = [
        {
            category: "Example 1"
        },
        {
            category: "Example 2"
        }
    ];
    emrServiceMock.getAll.mockReturnValue(categories);

    // Assert
    expect(emrController.getCategory()).toEqual(categories);
    expect(emrServiceMock.getAll).toHaveBeenCalled();
  });
});
