import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { EntityNotFoundError } from "typeorm";

@Catch(EntityNotFoundError)
export class EntityNotFoundExceptionFilter implements ExceptionFilter {
  catch(error: EntityNotFoundError, host: ArgumentsHost) {
    const responce = host.switchToHttp().getResponse();
    responce.status(HttpStatus.NOT_FOUND).json({
      statusCode : HttpStatus.NOT_FOUND,
      message: 'Not found'
    })
  }
}