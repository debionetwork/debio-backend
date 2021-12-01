import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StateService } from '../../../src/location/state.service';
import { State } from '../../../src/location/models/state.entity';
import { MockType, repositoryMockFactory } from '../mock';
import { Repository } from 'typeorm';
import { when } from 'jest-when';

describe('State Service Unit Tests', () => {
  let stateService: StateService;
  let repositoryMock: MockType<Repository<State>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StateService,
        { provide: getRepositoryToken(State, 'dbLocation'), useFactory: repositoryMockFactory },
      ],
    }).compile();
    stateService = module.get(StateService);
    repositoryMock = module.get(getRepositoryToken(State, 'dbLocation'));
  });

  it('should be defined', () => {
    // Assert
    expect(stateService).toBeDefined();
  });

  it('should find all states', () => {
    // Arrange
    const COUNTRY = "1";
    const RESULTS = [
        {
            state: "Region 1"
        },
        {
            state: "Region 2"
        }
    ];
    const PARAM = {
      where: { country_code: COUNTRY },
      order: {
        'name' : 'ASC'
      }
    };
    when(repositoryMock.find).calledWith(PARAM).mockReturnValue(RESULTS);

    // Assert
    expect(stateService.getAllRegion(COUNTRY)).resolves.toEqual(RESULTS);
    expect(repositoryMock.find).toHaveBeenCalledWith(PARAM);
    expect(repositoryMock.find).toHaveBeenCalled();
  });

  it('should find one state', () => {
    // Arrange
    const COUNTRY = "1";
    const STATE = "1";
    const RESULTS = [
        {
            state: "Region 1"
        },
        {
            state: "Region 2"
        }
    ];
    const PARAM = {
      where: {
        country_code: COUNTRY,
        state_code: STATE,
      },
    };
    when(repositoryMock.findOne).calledWith(PARAM).mockReturnValue(RESULTS);

    // Assert
    expect(stateService.getState(COUNTRY, STATE)).resolves.toEqual(RESULTS);
    expect(repositoryMock.findOne).toHaveBeenCalledWith(PARAM);
    expect(repositoryMock.findOne).toHaveBeenCalled();
  });
});
