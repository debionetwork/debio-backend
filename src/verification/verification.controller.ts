import { Controller, Headers, Post, Query, Res } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { Response } from "express";
import { VerificationService } from "./verifivcation.service";

@Controller('lab-verification')
export class VerificationController {
  constructor(
    private readonly verificationService: VerificationService
  ) {}
  
  @Post()
  @ApiQuery({ name: 'acount_id'})
  async updateStatusLab(
    @Headers('debio-api-key') debioApiKey: string,
    @Res() response: Response,
    @Query('acount_id') acount_id: string
    ) {
    try {
      if (debioApiKey != process.env.DEBIO_API_KEY) {
        return response.status(401).send('debio-api-key header is required');
      }
      await this.verificationService.vericationLab(acount_id)
      
      return response.status(200).send(`Lab ${acount_id} Verified, and Got Reward 2 DBIO`)
    } catch (error) {
      return response.status(500).send(error)
    }
  }
}