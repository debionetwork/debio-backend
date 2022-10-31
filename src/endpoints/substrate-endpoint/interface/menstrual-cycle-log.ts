export interface MenstrualCycleLogInterface {
  id: string;
  menstrual_calendar_id: string;
  date: number;
  menstruation: boolean;
  symptoms: Array<string>;
  created_at: string;
  account_id: string;
  menstrual_calendar_cycle_log_id: string;
}

export interface MenstrualCycleLogResultErrorInterface {
  status: number;
  message: string;
}

export interface MenstrualCycleLogResultSuccessInterface {
  status: number;
  data: Array<MenstrualCycleLogInterface>;
}

export class MenstrualCycleLogErrorNotFound extends Error {
  constructor(message) {
    super(message)
  }
}
