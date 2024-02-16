import dotenv from 'dotenv';
dotenv.config();

export const config = {
    REDIS_HOST : process.env.HOST_REDIS ?? 'localhost',
    REDIS_PORT : process.env.PORT_REDIS ?? '6379',
    REDIS_PASSWORD : process.env.REDIS_PASSWORD ?? 'root',
    COINMARKETCAP_API_KEY : process.env.API_KEY_COINMARKETCAP ?? '',
    COINMARKETCAP_HOST : process.env.COINMARKETCAP_HOST ?? '',
    DEBIO_ESCROW_PRIVATE_KEY : process.env.DEBIO_ESCROW_PRIVATE_KEY ?? '',
    WEB3_RPC_HTTPS : process.env.WEB3_RPC_HTTPS ?? '',
    ESCROW_CONTRACT_ADDRESS : process.env.ESCROW_CONTRACT_ADDRESS ?? '' ,
};
