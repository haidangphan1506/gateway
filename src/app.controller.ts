import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from '@packages/decorators';
import { KafkaProducer } from './features/kafka/kafka.producer';
// import { Public } from '@packages/decorators'; // commented out: only used by the removed RabbitMQ health route

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
    summary: 'Health check',
    description: 'Returns a simple health check response from kafka ...',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Server is running',
    schema: { type: 'string', example: 'Hello World!' },
  })
  async pingMsgFromKafkaController() {
    this.logger.log('Send from kafka in gateway :', 123);
    return await this.kafkaProducer.emit('kafka.ping', 123);
  }
}
