import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './models/state.entity';

@Injectable()
export class StateService extends TypeOrmQueryService<State> {
  constructor(
    @InjectRepository(State, 'dbLocation')
    private readonly stateRepository: Repository<State>,
  ) {
    super(stateRepository);
  }

  getAllRegion(country_code: string) {
    return this.stateRepository.find({
      where: { country_code },
    });
  }

  async getState(
    country_code: string,
    state_code: string
    ) {
    return this.stateRepository.findOne({
      where: { 
        country_code,
        state_code
      },
    });
  }
}
