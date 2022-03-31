import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ProcessEnvProxy } from '../proxies';
/**if FE input Api key with bcrypt
 * import * as bcrypt from 'bcrypt';
 */

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly process: ProcessEnvProxy,
    private readonly jwtService: JwtService,
  ) {}

  async validateApiKey(apiKey: string, cookie: any) {
    /** if FE input Api key with bcrypt
     * if(await bcrypt.compare(apiKey, this.process.env.DEBIO_API_KEY)) {
     */
    if (!(apiKey === this.process.env.DEBIO_API_KEY)) {
      throw new BadRequestException('invalid api key');
    }

    if (cookie) {
      try {
        await this.jwtService.verifyAsync(cookie);
      } catch (error) {
        throw new BadRequestException('invalid cresdetial');
      }
    }

    return await this.jwtService.signAsync(apiKey);
  }
}
