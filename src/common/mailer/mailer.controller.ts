import { Controller, OnModuleInit, Param, Post, Res } from "@nestjs/common";
import { ApiParam } from "@nestjs/swagger";
import { LabRegister, LabRegisterService, MailerManager } from ".";
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
    const contextLab = await queryLabById(this.api, lab_id)

    const certifications = await queryCertificationsByMultipleIds(this.api, contextLab.certifications)
    const services = await queryServicesByMultipleIdsArray(this.api, contextLab.services)
    // contextLab.services = services
    // console.log('contextLab---: ', contextLab)
    // console.log('services---: ', JSON.stringify(services,null,2))

    const labRegister = new LabRegister()
    const labRegisterServices: Array<LabRegisterService> =
      new Array<LabRegisterService>();

    services.forEach((val) => {
      const lrs: LabRegisterService = new LabRegisterService();
      lrs.name = val.info.name;
      lrs.category = val.info.category;
      lrs.price = val.price;
      lrs.qc_price = val.qc_price;
      lrs.description = val.info.description;
      lrs.long_description = val.info.longDescription;
      lrs.test_result_sample = val.info.testResultSample;
      lrs.expected_duration = val.info.expectedDuration;
      labRegisterServices.push(lrs);
    });
    labRegister.email = contextLab.info.email;
    labRegister.phone_number = contextLab.info.phone_number;
    labRegister.website = contextLab.info.website;
    labRegister.lab_name = contextLab.info.name;
    labRegister.country = contextLab.info.country;
    labRegister.state = contextLab.info.region;
    labRegister.city = contextLab.info.city;
    labRegister.address = contextLab.info.address;
    labRegister.profile_image = contextLab.info.profile_image;
    labRegister.services = labRegisterServices
    labRegister.certifications = []


    response.status(200).send({
      labRegister,
      certifications
      
    })

  }
}