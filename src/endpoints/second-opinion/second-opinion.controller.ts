import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SecondOpinionService } from './second-opinion.service';

@Controller('second-opinion')
export class SecondOpinionController {
  constructor(private readonly secondOpinionService: SecondOpinionService) {}

  @Get('health-professional-specialization')
  @ApiResponse({
    schema: {
      example: {
        data: [
          {
            id: 1,
            specialization: 'Specialization Name',
            created_at: new Date(),
          },
        ],
      },
    },
  })
  @ApiOperation({ description: 'get all health professional' })
  async getHealthProfessional() {
    const allHealthProfessionalSpecialization =
      await this.secondOpinionService.findAllHealthProfessionalSpecialization();

    return {
      data: allHealthProfessionalSpecialization,
    };
  }

  @Get('health-professional-role')
  @ApiResponse({
    schema: {
      example: {
        data: [
          {
            id: 1,
            specialization: 'Category Name',
            created_at: new Date(),
          },
        ],
      },
    },
  })
  @ApiOperation({ description: 'get all health professional role' })
  async getHealthProfessionalRole() {
    const allHealthProfessionalRole =
      await this.secondOpinionService.findAllHealthProfessionalRole();

    return {
      data: allHealthProfessionalRole,
    };
  }
}
