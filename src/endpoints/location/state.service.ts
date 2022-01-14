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

  async getAllRegion(country_code: string) {
    return await this.stateRepository.find({
      where: { country_code },
      order: {
        name: 'ASC',
      },
    });
  }

  async getState(country_code: string, state_code: string) {
    const res = await this.stateRepository.findOne({
      where: {
        country_code,
        state_code,
      },
    });
    
    if(!res){
      return {
        country_code,
        state_code,
        name: state_code
      }
    }
    
    return res
  }
}
