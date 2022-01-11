import {
  CustomerStakingRequestService,
  LabRegister,
  LabRegisterCertification,
  LabRegisterService,
} from '../../../../../src/common';

export const certification: LabRegisterCertification = {
  title: 'string',
  issuer: 'string',
  month: 'string',
  year: 'string',
  description: 'string',
  supporting_document: 'string',
};

export const service: LabRegisterService = {
  category: 'string',
  name: 'string',
  price: 'string',
  currency: 'string',
  qc_price: 'string',
  description: 'string',
  long_description: 'string',
  supporting_document: 'string',
  test_result_sample: 'string',
  expected_duration: {
    duration: 'string',
    duration_type: 'string',
  },
};

export const labRegister: LabRegister = {
  email: 'string',
  phone_number: 'string',
  website: 'string',
  lab_name: 'string',
  country: 'string',
  state: 'string',
  city: 'string',
  profile_image: 'string',
  address: 'string',
  certifications: [certification],
  services: [service],
};

export const customerStakingRequestService: CustomerStakingRequestService = {
  service_name: 'string',
  public_address: 'string',
  country: 'string',
  state: 'string',
  city: 'string',
  amount: 1,
  currency: 'string',
};
