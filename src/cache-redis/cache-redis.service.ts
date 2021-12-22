import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class CacheRedisService {
	constructor() {}
	  async	getExchange() {
      const res = await axios.get(`${process.env.REDIS_STORE_URL}/cache`, {
        auth: {
          username: process.env.REDIS_STORE_USERNAME,
          password: process.env.REDIS_STORE_PASSWORD
        }
      })
      return res.data
	}

}