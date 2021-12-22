import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import axios, { AxiosResponse } from "axios";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators'

@Injectable()
export class CacheRedisService {
	constructor(private httpService: HttpService) {}

		getExchange(): Observable<AxiosResponse<any>>{
		return this.httpService.get('https://conversion.dev.debio.network/cache')
		.pipe(
			map(res =>{
        console.log(res.data);
        
        return res.data
      })
		)
	}

}