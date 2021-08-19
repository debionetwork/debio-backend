import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './models/state.entity';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
  ) {}

  getAllRegion(country_code: string) {
    return this.stateRepository.find({
      where: { country_code },
    });
  }
}
