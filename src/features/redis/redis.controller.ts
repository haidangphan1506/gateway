import { Controller, Get, HttpCode, Query } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices'; // commented out: RabbitMQ client removed
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { ZodValidationPipe } from '@packages/pipes';
import { getRedisQuerySchema, type GetRedisQueryDto } from '@packages/entities/redis';
// import { sendRpc } from '@packages/helpers'; // commented out: RabbitMQ request helper removed
// import { THIRD_SERVICE } from '../rmq-clients/rmq-clients.constants'; // commented out: RabbitMQ client removed

/**
 * Gateway is a thin HTTP edge for `redis`: validation/guards/Swagger stay, the handler forwards
 * to the `third-service` over RabbitMQ via `sendRpc`.
 */
@ApiTags('Redis')
@ApiBearerAuth('access-token')
@Controller('redis')
export class RedisController {
  // constructor(@Inject(THIRD_SERVICE) private readonly thirdClient: ClientProxy) {}
  constructor() {}

  @Get()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get Redis value', description: 'Retrieve a value from Redis by key' })
  @ApiQuery({ name: 'key', required: true, type: String, description: 'Redis key' })
  @SwaggerResponse({ status: 200, description: 'Value retrieved (null if key does not exist)' })
  get(
    @Query(new ZodValidationPipe<GetRedisQueryDto>(getRedisQuerySchema)) _query: GetRedisQueryDto,
  ) {
    // return sendRpc(this.thirdClient, 'redis.get', query); // commented out: RabbitMQ request disabled
    throw new Error('redis.get is disabled — RabbitMQ request commented out');
  }
}