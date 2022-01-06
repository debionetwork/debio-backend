import { Controller, OnModuleInit, Param, Post, Res } from "@nestjs/common";
import { ApiParam } from "@nestjs/swagger";
import { LabRegister, MailerManager } from ".";
import { Response } from 'express';
import { ApiPromise, WsProvider } from "@polkadot/api";
import { queryLabById} from "../../polkadot-provider";

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

    const labRegister: LabRegister = await this.mailerManager.labToLabRegister(contextLab);
    
    await this.mailerManager.sendLabRegistrationEmail(
      process.env.EMAILS.split(','),
      labRegister,
    );
    response.status(200).send({
      message: "Sending Email."
    })

  }
}