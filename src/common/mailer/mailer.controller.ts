import { Controller, OnModuleInit, Param, Post, Res } from "@nestjs/common";
import { ApiParam } from "@nestjs/swagger";
import { MailerManager } from ".";
import { Response } from 'express';
import { ApiPromise, WsProvider } from "@polkadot/api";
import { queryServicesByMultipleIds, queryLabById, queryCertificationsByMultipleIds, queryServicesByMultipleIdsArray } from "../polkadot-provider";

@Controller('email')
export class MailerController implements OnModuleInit {
  private api: ApiPromise
  constructor(
    private mailerManager: MailerManager
  ) {}

  async onModuleInit(){
    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL)
    this.api = await ApiPromise.create({
      provider: wsProvider
    })
  }

  @Post('registered-lab/:lab_id')
  @ApiParam({ name: 'lab_id'})
  async sendMailRegisteredLab(
    @Param('lab_id') lab_id: string,
    @Res() response: Response
  ) {    
    const context = await queryLabById(this.api, lab_id)
    console.log(context.services);
    
    // const certifications = await queryCertificationsByMultipleIds(this.api, context.certifications)
    const services = await queryServicesByMultipleIdsArray(this.api, context.services)
    console.log('serivecs: ', context.services)
    response.status(200).send({
      context,
      // certifications,
      services
    })
  }
}