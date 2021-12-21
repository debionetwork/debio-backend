import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import axios from "axios";
import { map } from 'rxjs/operators'

@Injectable()
export class CacheRedisService {
	constructor(private httpService: HttpService) {}

	getExchange(){
		return this.httpService.get('http://localhost:3000/cache')
		.pipe(
			map(res => res.data)
		)
	}
	async	getAxios(){
		const res = await axios({
			method: 'GET',
			url: 'http://localhost:3000/cache',
			responseType: 'json',
			timeout: 5000
		})

		return res
	}
}