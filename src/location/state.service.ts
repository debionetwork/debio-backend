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
<<<<<<< HEAD
    super(stateRepository)
=======
    super(stateRepository);
>>>>>>> 21b18fa13c70567207df7fab20e8cc8e384143ec
  }

  getAllRegion(country_code: string) {
    return this.stateRepository.find({
      where: { country_code },
    });
  }
}
