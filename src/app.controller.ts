import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from '@packages/decorators';
import { KafkaProducer } from './features/kafka/kafka.producer';

@ApiTags('Health')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns a simple health check response' })
  @SwaggerResponse({
    status: 200,
    description: 'Server is running',
    schema: { type: 'string', example: 'Hello World!' },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('kafka')
  @ApiOperation({
    summary: 'Kafka emit health check',
    description: 'Fire-and-forget ping to the user service over Kafka — no reply is awaited',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Ping emitted',
    schema: { type: 'string', example: 'Hello World!' },
  })
  async pingMsgFromKafkaController(): Promise<unknown> {
    this.logger.log(`[EMIT] kafka.emit -> user, payload=123`);
    return await this.kafkaProducer.emit<unknown, number>('kafka.ping', 123);
  }

  @Public()
  @Get('kafka/error')
  @ApiOperation({
    summary: 'Kafka emit health check',
    description: 'Fire-and-forget ping to the user service over Kafka — no reply is awaited',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Ping emitted',
    schema: { type: 'string', example: 'Hello World!' },
  })
  async testMsgError(): Promise<unknown> {
    this.logger.log(`[EMIT] kafka.emit -> user, payload=123`);
    return await this.kafkaProducer.send<unknown, number>('kafka.user.error', 123);
  }


  @Public()
  @Get('kafka/tutor/error')
  @ApiOperation({
    summary: 'Kafka emit health check',
    description: 'Fire-and-forget ping to the user service over Kafka — no reply is awaited',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Ping emitted',
    schema: { type: 'string', example: 'Hello World!' },
  })
  async testError(): Promise<unknown> {
    this.logger.log(`[SEND] kafka.emit -> user, payload=123`);
    return await this.kafkaProducer.send<unknown, number>('kafka.user', 123);
  }

}
