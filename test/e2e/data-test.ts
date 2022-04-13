import { EmrCategory } from '../../src/endpoints/category/emr/models/emr.entity';
import { ServiceCategory } from '../../src/endpoints/category/service/models/service-category.service';
import { SpecializationCategory } from '../../src/endpoints/category/specialization/models/specialization.entity';

export const emrList: EmrCategory[] = [
  {
    id: 1,
    category: 'Allergies and adverse drug reactions',
    created_at: new Date(),
  },
  {
    id: 2,
    category: 'Chronic diseases',
    created_at: new Date(),
  },
  {
    id: 3,
    category: 'Family medical history',
    created_at: new Date(),
  },
  {
    id: 4,
    category: 'Illnesses and hospitalizations',
    created_at: new Date(),
  },
  {
    id: 5,
    category: 'Laboratory test results',
    created_at: new Date(),
  },
  {
    id: 6,
    category: 'Medications and dosing',
    created_at: new Date(),
  },
  {
    id: 7,
    category: 'Prescription record',
    created_at: new Date(),
  },
  {
    id: 8,
    category: 'Surgeries and other procedures',
    created_at: new Date(),
  },
  {
    id: 9,
    category: 'Vaccinations',
    created_at: new Date(),
  },
  {
    id: 10,
    category: 'Observations of daily living (ODLs)',
    created_at: new Date(),
  },
  {
    id: 11,
    category: 'Others',
    created_at: new Date(),
  },
];

export const serviceList: ServiceCategory[] = [
  {
    id: 1,
    service_categories: 'Single Gene',
    name: 'Single Gene',
    ticker: '$SNGL',
    created_at: new Date(),
    service_type: 'Genetic Testing',
  },
  {
    id: 2,
    service_categories: 'SNP Microarray',
    name: 'SNP Microarray',
    ticker: '$SNPM',
    created_at: new Date(),
    service_type: 'Genetic Testing',
  },
  {
    id: 3,
    service_categories: 'Targeted Gene Panel Sequencing',
    name: 'Targeted Gene Panel Sequencing',
    ticker: '$TGPS',
    created_at: new Date(),
    service_type: 'Genetic Testing',
  },
  {
    id: 4,
    service_categories: 'Whole Exome Sequencing',
    name: 'Whole Exome Sequencing',
    ticker: '$WES',
    created_at: new Date(),
    service_type: 'Genetic Testing',
  },
  {
    id: 5,
    service_categories: 'Whole Genome Sequencing',
    name: 'Whole Genome Sequencing',
    ticker: '$GENE',
    created_at: new Date(),
    service_type: 'Genetic Testing',
  },
  {
    id: 6,
    service_categories: 'Whole Transcriptome Sequencing',
    name: 'Whole Transcriptome Sequencing',
    ticker: '$WTS',
    created_at: new Date(),
    service_type: 'Genetic Testing',
  },
  {
    id: 7,
    service_categories: 'Pharmacogenomics',
    name: 'Pharmacogenomics',
    ticker: '$PHRM',
    created_at: new Date(),
    service_type: 'Genetic Testing',
  },
];

export const specializationList: SpecializationCategory[] = [
  {
    id: 1,
    category: 'Assisted Reproductive Therapy (ART)/Infertility',
    created_at: new Date(),
  },
  {
    id: 2,
    category: 'Cancer/Oncology',
    created_at: new Date(),
  },
  {
    id: 3,
    category: 'Cardiovascular',
    created_at: new Date(),
  },
  {
    id: 4,
    category: 'Cystic fbrosis',
    created_at: new Date(),
  },
  {
    id: 5,
    category: 'Fetal intervention and therapy (FIT)',
    created_at: new Date(),
  },
  {
    id: 6,
    category: 'Hematology',
    created_at: new Date(),
  },
  {
    id: 7,
    category: 'Metabolic',
    created_at: new Date(),
  },
  {
    id: 8,
    category: 'Neurology',
    created_at: new Date(),
  },
  {
    id: 9,
    category: 'Pediatric and clinical',
    created_at: new Date(),
  },
  {
    id: 10,
    category: 'Personalized medicine',
    created_at: new Date(),
  },
  {
    id: 11,
    category: 'Prenatal',
    created_at: new Date(),
  },
  {
    id: 12,
    category: 'Others',
    created_at: new Date(),
  },
];
