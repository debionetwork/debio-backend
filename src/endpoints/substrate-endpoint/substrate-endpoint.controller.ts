import {
  Body,
  Controller,
  Post,
  Res,
  Headers,
  UseInterceptors,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { RewardService } from '../../common/modules/reward/reward.service';
import { RewardDto } from '../../common/modules/reward/dto/reward.dto';
import { SentryInterceptor } from '../../common/interceptors';
import { WalletBindingDTO } from './dto/wallet-binding.dto';
import { ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  ServiceRequestService,
  LabService,
  OrderService,
  ServiceService,
  GeneticAnalysisService,
  GeneticAnalysisOrderService,
} from './services';
import {
  sendRewards,
  queryAccountIdByEthAddress,
  setEthAddress,
  setGeneticAnalysisOrderPaid,
} from '../../common/polkadot-provider';
import { DateTimeProxy, ProcessEnvProxy, SubstrateService } from '../../common';

@Controller('substrate')
@UseInterceptors(SentryInterceptor)
export class SubstrateController {
  constructor(
    private readonly substrateService: SubstrateService,
    private readonly labService: LabService,
    private readonly serviceService: ServiceService,
    private readonly orderService: OrderService,
    private readonly rewardService: RewardService,
    private readonly process: ProcessEnvProxy,
    private readonly dateTime: DateTimeProxy,
    private readonly serviceRequestService: ServiceRequestService,
    private readonly geneticAnalysisService: GeneticAnalysisService,
    private readonly geneticAnalysisOrderService: GeneticAnalysisOrderService,
  ) {}

  @Get('/labs')
  @ApiQuery({ name: 'country' })
  @ApiQuery({ name: 'region' })
  @ApiQuery({ name: 'city' })
  @ApiQuery({ name: 'category' })
  @ApiQuery({
    name: 'service_flow',
    enum: ['RequestTest', 'StakingRequestService'],
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  async findByCountryCityCategory(
    @Query('country') country,
    @Query('region') region,
    @Query('city') city,
    @Query('category') category,
    @Query('service_flow') service_flow: boolean,
    @Query('page') page,
    @Query('size') size,
  ): Promise<any> {
    const services = await this.labService.getByCountryCityCategory(
      country,
      region,
      city,
      category,
      service_flow,
      Number(page),
      Number(size),
    );
    return services;
  }

  @Get('/services/:country/:city')
  @ApiParam({ name: 'country' })
  @ApiParam({ name: 'city' })
  async findByCountryCity(@Param() params): Promise<any> {
    const services = await this.serviceService.getByCountryCity(
      params.country,
      params.city,
    );
    return services;
  }

  @Get('/orders/:hash_id')
  async getOrderById(@Param('hash_id') hashId: string) {
    const order = await this.orderService.getOrderByHashId(hashId);
    return order;
  }

  @Get('/orders/list/:customer_id')
  @ApiParam({ name: 'customer_id' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  async getOrderByCustomer(
    @Param() params,
    @Query('keyword') keyword: string,
    @Query('page') page,
    @Query('size') size,
  ) {
    const orders = await this.orderService.getOrderList(
      'customer',
      params.customer_id,
      keyword ? keyword.toLowerCase() : '',
      Number(page),
      Number(size),
    );

    return orders;
  }

  @Get('/orders/bounty_list/:customer_id')
  @ApiParam({ name: 'customer_id' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  async getBountyByProductNameStatusLabName(
    @Param() params,
    @Query('keyword') keyword: string,
    @Query('page') page,
    @Query('size') size,
  ) {
    const orders = await this.orderService.getBountyList(
      params.customer_id,
      keyword ? keyword.toLowerCase() : '',
      Number(page),
      Number(size),
    );

    return orders;
  }

  @Get('/orders/list/lab/:lab_id')
  @ApiParam({ name: 'lab_id' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  async getOrderByLab(
    @Param() params,
    @Query('keyword') keyword: string,
    @Query('page') page,
    @Query('size') size,
  ) {
    const orders = await this.orderService.getOrderList(
      'lab',
      params.lab_id,
      keyword ? keyword.toLowerCase() : '',
      Number(page),
      Number(size),
    );

    return orders;
  }

  @Get('/countries')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  async getAggregatedByCountries(
    @Query('page') page,
    @Query('size') size,
  ): Promise<any> {
    const serviceRequests =
      await this.serviceRequestService.getAggregatedByCountries(
        Number(page),
        Number(size),
      );
    return serviceRequests;
  }

  @Get('/service-request/:customerId')
  @ApiParam({ name: 'customerId' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  async getServiceRequestByCustomer(
    @Param('customerId') customerId,
    @Query('page') page,
    @Query('size') size,
  ) {
    const requestServiceByCustomer =
      await this.serviceRequestService.getByCustomerId(
        customerId,
        Number(page),
        Number(size),
      );
    return requestServiceByCustomer;
  }

  @Get('/provideRequestService')
  @ApiQuery({ name: 'countryCode' })
  @ApiQuery({ name: 'regionCode' })
  @ApiQuery({ name: 'city' })
  @ApiQuery({ name: 'category' })
  async getCustomerProvidedService(
    @Query('countryCode') countryCode,
    @Query('regionCode') regionCode,
    @Query('city') city,
    @Query('category') category,
  ) {
    const requestServiceByCustomer =
      await this.serviceRequestService.provideRequestService(
        countryCode,
        regionCode,
        city,
        category,
      );
    return requestServiceByCustomer;
  }

  
  @Get('/genetic-analysis/:tracking_id')
  async getGeneticAnalysisByTrackingId(@Param('tracking_id') tracking_id: string) {
    const geneticAnalysis = await this.geneticAnalysisService.getGeneticAnalysisByTrackingId(tracking_id);
    return geneticAnalysis;
  }

  @Get('/genetic-analysis-order/list/analyst/:analyst_id')
  @ApiParam({ name: 'analyst_id' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  async getGeneticAnalysisOrderByAnalyst(
    @Param() params,
    @Query('keyword') keyword: string,
    @Query('page') page,
    @Query('size') size,
  ) {
    const genetic_analysis_orders = await this.geneticAnalysisOrderService.getGeneticAnalysisOrderList(
      'analyst',
      params.analyst_id,
      keyword ? keyword.toLowerCase() : '',
      Number(page),
      Number(size),
    );

    return genetic_analysis_orders;
  }

  @Get('/genetic-analysis-order/list/customer/:customer_id')
  @ApiParam({ name: 'customer_id' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  async getGeneticAnalysisOrderByCustomer(
    @Param() params,
    @Query('keyword') keyword: string,
    @Query('page') page,
    @Query('size') size,
  ) {
    const genetic_analysis_orders = await this.geneticAnalysisOrderService.getGeneticAnalysisOrderList(
      'customer',
      params.customer_id,
      keyword ? keyword.toLowerCase() : '',
      Number(page),
      Number(size),
    );

    return genetic_analysis_orders;
  }

  @Post('/wallet-binding')
  async walletBinding(
    @Body() payload: WalletBindingDTO,
    @Res() response: Response,
    @Headers('debio-api-key') debioApiKey: string,
  ) {
    if (debioApiKey != this.process.env.DEBIO_API_KEY) {
      return response.status(401).send('debio-api-key header is required');
    }
    const { accountId, ethAddress } = payload;
    const rewardAmount = 0.2;

    const dataInput: RewardDto = {
      address: accountId,
      ref_number: '-',
      reward_amount: rewardAmount,
      reward_type: 'Registered User',
      currency: 'DBIO',
      created_at: this.dateTime.new(),
    };
    let reward = null;
    const isSubstrateAddressHasBeenBinding = await queryAccountIdByEthAddress(
      this.substrateService.api,
      ethAddress,
    );

    const bindingEth = await setEthAddress(
      this.substrateService.api,
      this.substrateService.pair,
      accountId,
      ethAddress,
    );

    if (!bindingEth) {
      return response.status(401).send('Binding Error');
    }

    const isRewardHasBeenSend =
      await this.rewardService.getRewardBindingByAccountId(accountId);

    if (!isSubstrateAddressHasBeenBinding && !isRewardHasBeenSend) {
      const dbioUnit = 10 ** 18;
      await sendRewards(
        this.substrateService.api,
        this.substrateService.pair,
        accountId,
        (rewardAmount * dbioUnit).toString(),
      );
      reward = rewardAmount;
      await this.rewardService.insert(dataInput);
    }

    return response.status(200).send({
      reward,
      message: `eth-address ${ethAddress} bound to ${accountId}`,
    });
  }

  @Post('/genetic-anasysis-order-paid')
  async geneticAnalysisOrderPaid(
    @Body() genetic_analysis_order_id: string,
    @Res() response: Response,
    @Headers('debio_api_key') debioApiKey: string,
  ){
    if (debioApiKey != this.process.env.DEBIO_API_KEY) {
      return response.status(401).send('debio-api-key header is required');
    }

    await setGeneticAnalysisOrderPaid(
      this.substrateService.api,
      this.substrateService.pair,
      genetic_analysis_order_id
    )
    
    return response.status(200).send(`set order paid with genetic analysis order id ${genetic_analysis_order_id} on progress`)
  }
}
