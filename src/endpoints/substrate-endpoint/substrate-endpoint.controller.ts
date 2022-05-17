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
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
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
  adminSetEthAddress,
  setGeneticAnalysisOrderPaid,
  dbioUnit,
} from '@debionetwork/polkadot-provider';
import { DateTimeProxy, ProcessEnvProxy, SubstrateService } from '../../common';
import { GeneticAnalysisOrderPaidDto } from './dto/genetic-analysis-order-paid.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationDto } from '../notification/dto/notification.dto';
import {
  labsResponse,
  orderByCustomerId,
  orderByHash,
  serviceByLocation,
  stakingRequestService,
  requestServiceByCustomer,
  provideRequestServiceResponse,
  geneticAnalysisByTrakingIdResponse,
  geneticAnalysisOrderByGA,
} from './models/response';

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
    private readonly notificationService: NotificationService,
  ) {}

  @Get('/labs')
  @ApiQuery({ name: 'country' })
  @ApiQuery({ name: 'region' })
  @ApiQuery({ name: 'city' })
  @ApiQuery({ name: 'category' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  @ApiOperation({
    description: 'Get data service by service flow and locations.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: labsResponse,
    },
  })
  async findByCountryCityCategory(
    @Query('country') country,
    @Query('region') region,
    @Query('city') city,
    @Query('category') category,
    @Query('service_flow') service_flow,
    @Query('page') page,
    @Query('size') size,
  ): Promise<any> {
    const services = await this.labService.getByCountryCityCategory(
      country,
      region,
      city,
      category,
      Number(page),
      Number(size),
    );
    return services;
  }

  @Get('/services/:country/:city')
  @ApiParam({ name: 'country' })
  @ApiParam({ name: 'city' })
  @ApiOperation({ description: 'Get list lab service in city.' })
  @ApiResponse({
    status: 200,
    schema: {
      example: serviceByLocation,
    },
  })
  async findByCountryCity(@Param() params): Promise<any> {
    const services = await this.serviceService.getByCountryCity(
      params.country,
      params.city,
    );
    return services;
  }

  @Get('/orders/:hash_id')
  @ApiOperation({ description: 'Get detail order by id.' })
  @ApiResponse({
    status: 200,
    schema: {
      example: orderByHash,
    },
  })
  async getOrderById(@Param('hash_id') hashId: string) {
    const order = await this.orderService.getOrderByHashId(hashId);

    return order;
  }

  @Get('/orders/list/:customer_id')
  @ApiParam({ name: 'customer_id' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  @ApiOperation({
    description: 'Get list order customer by customer_id or keyword.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: orderByCustomerId,
    },
  })
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

    const ordersGA =
      await this.geneticAnalysisOrderService.getGeneticAnalysisOrderList(
        'customer',
        params.customer_id,
        keyword ? keyword.toLowerCase() : '',
        Number(page),
        Number(size),
      );

    return { orders, ordersGA };
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
  @ApiOperation({
    description: 'get number of staking request service group by location.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: stakingRequestService,
    },
  })
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
  @ApiOperation({ description: 'Get list data service request by customer.' })
  @ApiResponse({
    status: 200,
    schema: {
      example: requestServiceByCustomer,
    },
  })
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
  @ApiOperation({ description: 'Get list ' })
  @ApiResponse({
    status: 200,
    schema: {
      example: provideRequestServiceResponse,
    },
  })
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
  @ApiOperation({ description: 'get data genetic analysis by traking id' })
  @ApiResponse({
    status: 200,
    schema: {
      example: geneticAnalysisByTrakingIdResponse,
    },
  })
  async getGeneticAnalysisByTrackingId(
    @Param('tracking_id') tracking_id: string,
  ) {
    const geneticAnalysis =
      await this.geneticAnalysisService.getGeneticAnalysisByTrackingId(
        tracking_id,
      );
    return geneticAnalysis;
  }

  @Get('/genetic-analysis-order/list/analyst/:analyst_id')
  @ApiParam({ name: 'analyst_id' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  @ApiOperation({ description: 'Get data genetic analyst order by analyst' })
  @ApiResponse({
    status: 200,
    schema: {
      example: geneticAnalysisOrderByGA,
    },
  })
  async getGeneticAnalysisOrderByAnalyst(
    @Param() params,
    @Query('keyword') keyword: string,
    @Query('page') page,
    @Query('size') size,
  ) {
    const genetic_analysis_orders =
      await this.geneticAnalysisOrderService.getGeneticAnalysisOrderList(
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
  @ApiOperation({ description: 'Get data genetic analysis order by customer' })
  @ApiResponse({
    status: 200,
    schema: {
      example: geneticAnalysisOrderByGA,
    },
  })
  async getGeneticAnalysisOrderByCustomer(
    @Param() params,
    @Query('keyword') keyword: string,
    @Query('page') page,
    @Query('size') size,
  ) {
    const genetic_analysis_orders =
      await this.geneticAnalysisOrderService.getGeneticAnalysisOrderList(
        'customer',
        params.customer_id,
        keyword ? keyword.toLowerCase() : '',
        Number(page),
        Number(size),
      );

    return genetic_analysis_orders;
  }

  @Post('/wallet-binding')
  @ApiOperation({ description: 'binding metamask wallet and polkatod wallet.' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        reward: 0,
        message: `eth-address <ethAddress> bound to <accountId>`,
      },
    },
  })
  async walletBinding(
    @Headers('debio-api-key') debioApiKey: string,
    @Body() payload: WalletBindingDTO,
    @Res() response: Response,
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
      this.substrateService.api as any,
      ethAddress,
    );

    try {
      // eslint-disable-next-line
      const substrateServicePromise = new Promise((resolve, _reject) => {
        adminSetEthAddress(
          this.substrateService.api as any,
          this.substrateService.pair,
          accountId,
          ethAddress,
          () => resolve('resolve'),
        );
      });
      await substrateServicePromise;
    } catch {
      return response.status(401).send('Binding Error');
    }

    const isRewardHasBeenSend =
      await this.rewardService.getRewardBindingByAccountId(accountId);

    if (!isSubstrateAddressHasBeenBinding && !isRewardHasBeenSend) {
      // eslint-disable-next-line
      sendRewards(
        this.substrateService.api as any,
        this.substrateService.pair,
        accountId,
        (rewardAmount * dbioUnit).toString(),
        async () => {
          const walletBindingNotification: NotificationDto = {
            role: payload.role,
            entity_type: 'Reward',
            entity: 'Wallet Binding',
            description: `Congrats! You've got 0.01 DBIO from wallet binding.`,
            read: false,
            created_at: this.dateTime.new(),
            updated_at: this.dateTime.new(),
            deleted_at: null,
            from: 'Debio Network',
            to: accountId,
          };

          this.notificationService.insert(walletBindingNotification);
        },
      );

      reward = rewardAmount;

      await this.rewardService.insert(dataInput);
    }

    return response.status(200).send({
      reward,
      message: `eth-address ${ethAddress} bound to ${accountId}`,
    });
  }

  @Post('/geneticAnalysisOrderPaid')
  async geneticAnalysisOrderPaid(
    @Headers('debio-api-key') debioApiKey: string,
    @Body() geneticOrderId: GeneticAnalysisOrderPaidDto,
    @Res() response: Response,
  ) {
    const { genetic_analysis_order_id } = geneticOrderId;

    if (debioApiKey != this.process.env.DEBIO_API_KEY) {
      return response.status(401).send('debio-api-key header is required');
    }

    await setGeneticAnalysisOrderPaid(
      this.substrateService.api as any,
      this.substrateService.pair,
      genetic_analysis_order_id,
    );

    return response
      .status(200)
      .send(
        `set order paid with genetic analysis order id ${genetic_analysis_order_id} on progress`,
      );
  }
}
