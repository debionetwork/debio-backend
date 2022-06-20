import { Injectable, Logger } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

@Injectable()
export class GoogleSecretManagerService {
  private readonly logger: Logger = new Logger(GoogleSecretManagerService.name);
  private client: SecretManagerServiceClient;
  private envList: Map<string, string> = new Map<string, string>();
  private readConfig = true;

  constructor() {
    this.client = new SecretManagerServiceClient();
  }

  async accessAndAccessSecret() {
    if (!this.readConfig) return;
    try {
      const parent = 'projects/debio-network-development'; // TODO: change

      const [secrets] = await this.client.listSecrets({
        parent: parent,
      });

      for (let i = 0; i < secrets.length; i++) {
        const secret = secrets[i];
        const arrPath = secret.name.split('/');
        const envId = arrPath.at(-1);
        const [version] = await this.client.accessSecretVersion({
          name: `${secret.name}/versions/latest`,
        });
        const value = version.payload.data.toString();
        this.envList.set(envId, value);
      }
    } catch (err) {
      this.logger.log(err);
    } finally {
      this.readConfig = false;
    }
  }

  get hostPostgres() {
    return this.envList.get('POSTGRES_HOST');
  }

  get port() {
    return this.envList.get('PORT');
  }

  get usernamePostgres() {
    return this.envList.get('POSTGRES_USERNAME');
  }

  get passwordPostgres() {
    return this.envList.get('POSTGRES_PASSWORD');
  }

  get dbPostgres() {
    return this.envList.get('POSTGRES_DB');
  }

  get dbCity() {
    return this.envList.get('POSTGRES_DB_CITY');
  }

  get dbLocations() {
    return this.envList.get('POSTGRES_DB_LOCATIONS');
  }

  get substrateUrl() {
    return this.envList.get('SUBSTRATE_URL');
  }

  get adminSubstrateMnemonic() {
    return this.envList.get('ADMIN_SUBSTRATE_MNEMONIC');
  }

  get web3RPC() {
    return this.envList.get('WEB3_RPC');
  }

  get web3RPCHttp() {
    return this.envList.get('WEB3_RPC_HTTPS');
  }

  get debioEscrowPrivateKey() {
    return this.envList.get('DEBIO_ESCROW_PRIVATE_KEY');
  }

  get escrowContractAddress() {
    return this.envList.get('ESCROW_CONTRACT_ADDRESS');
  }

  get coinMarketCapApiKey() {
    return this.envList.get('COINMARKETCAP_API_KEY');
  }

  get elasticsearchNode() {
    return this.envList.get('ELASTICSEARCH_NODE');
  }

  get recaptchaSecretKey() {
    return this.envList.get('RECAPTCHA_SECRET_KEY');
  }

  get debioApiKey() {
    return this.envList.get('DEBIO_API_KEY');
  }

  get elasticsearchUsername() {
    return this.envList.get('ELASTICSEARCH_USERNAME');
  }

  get elasticsearchPassword() {
    return this.envList.get('ELASTICSEARCH_PASSWORD');
  }

  get email() {
    return this.envList.get('EMAIL');
  }

  get passEmail() {
    return this.envList.get('PASS_EMAIL');
  }

  get redisStoreUrl() {
    return this.envList.get('REDIS_STORE_URL');
  }

  get redisStoreUsername() {
    return this.envList.get('REDIS_STORE_USERNAME');
  }

  get redisStorePassword() {
    return this.envList.get('REDIS_STORE_PASSWORD');
  }

  get hostRedis() {
    return this.envList.get('REDIS_HOST');
  }

  get portRedis() {
    return this.envList.get('REDIS_PORT');
  }

  get redisPassword() {
    return this.envList.get('REDIS_PASSWORD');
  }

  get bucketName() {
    return this.envList.get('BUCKET_NAME');
  }

  get storageBaseUri() {
    return this.envList.get('STORAGE_BASE_URI');
  }

  get emails() {
    return this.envList.get('EMAILS');
  }

  get unstakeInterval() {
    return this.envList.get('UNSTAKE_INTERVAL');
  }

  get unstakeTimer() {
    return this.envList.get('UNSTAKE_TIMER');
  }

  get pinataApiKey() {
    return this.envList.get('PINATA_API_KEY');
  }

  get pinataSecretKey() {
    return this.envList.get('PINATA_SECRET_KEY');
  }

  get pinataEmail() {
    return this.envList.get('PINATA_EMAIL');
  }

  get pinataUserId() {
    return this.envList.get('PINATA_USER_ID');
  }

  get pinataEmailVerified() {
    return this.envList.get('PINATA_EMAIL_VERIFIED');
  }

  get pinataMfaEnabled() {
    return this.envList.get('PINATA_MFA_ENABLED');
  }

  get pinataPinPolicyRegionId() {
    return this.envList.get('PINATA_PIN_POLICY_REGION_ID');
  }

  get pinataPinPolicyRegionReplCount() {
    return this.envList.get('PINATA_PIN_POLICY_REGION_REPL_COUNT');
  }

  get pinataPrivateKey() {
    return this.envList.get('PINATA_SECRET_KEY');
  }

  get swaggerEnable() {
    return this.envList.get('SWAGGER_ENABLE');
  }

  get sentryDsn() {
    return this.envList.get('SENTRY_DSN');
  }

  get nodeEnv() {
    return this.envList.get('NODE_ENV');
  }
}
