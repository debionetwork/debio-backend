import { GeneticAnalystRegister, LabRegister } from "@common/index";
import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";

@Injectable()
export class EmailSenderService {
  constructor(
    @InjectQueue('email-sender-queue') private emailSenderQueue: Queue,) {}
    
  async sendToLab(labRegister: LabRegister) {
    this.emailSenderQueue.add('register-lab', labRegister);
  }

  async sendToGA(geneticAnalystRegister: GeneticAnalystRegister) {
    this.emailSenderQueue.add('register-ga', geneticAnalystRegister);
  }
}