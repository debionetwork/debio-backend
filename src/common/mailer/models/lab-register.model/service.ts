export class ExpectedDuration {
  duration: string;
  duration_type: string;
}

export class LabRegisterService {
  category: string;
  name: string;
  price: string;
  qc_price: string;
  description: string;
  long_description: string;
  supporting_document: string;
  test_result_sample: string;
  expected_duration: ExpectedDuration;
}
