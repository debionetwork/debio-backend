import { ApiProperty } from '@nestjs/swagger';

export class GeneticAnalysisOrderPaidDto {
  @ApiProperty({ type: String })
  genetic_analysis_order_id: string;
}
