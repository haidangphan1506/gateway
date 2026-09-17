import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import { RabbitMQConsumer } from './features/rabbitmq/rabbitmq.consumer'; // commented out: RabbitMQ removed
// import { RabbitMQProducer } from './features/rabbitmq/rabbitmq.producer'; // commented out: RabbitMQ removed

// const HEALTH_CHECK_ROUTING_KEY = 'health.check'; // commented out: RabbitMQ removed
// const HEALTH_CHECK_QUEUE = 'app.health-check'; // commented out: RabbitMQ removed

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor() {}

  async onModuleInit() {}

  getHello(): string {
    return 'Hello World!';
  }
}
