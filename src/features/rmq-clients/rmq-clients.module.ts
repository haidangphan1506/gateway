import { BadGatewayException, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  THIRD_QUEUE_DEFAULT,
  THIRD_SERVICE,
  TUTOR_QUEUE_DEFAULT,
  TUTOR_SERVICE,
  USER_QUEUE_DEFAULT,
  USER_SERVICE,
} from './rmq-clients.constants';

function rmqClientFactory(queueEnvVar: string, queueDefault: string) {
  return {
    useFactory: (configService: ConfigService) => {
      const rabbitMqUrl = configService.get<string>('RABBITMQ_URL');
      if (!rabbitMqUrl) throw new BadGatewayException('RabbitMq url not found ...');

      return {
        transport: Transport.RMQ as const,
        options: {
          urls: [rabbitMqUrl],
          queue: configService.get<string>(queueEnvVar) ?? queueDefault,
          queueOptions: { durable: true },
        },
      };
    },
    inject: [ConfigService],
  };
}

/**
 * Registers one RMQ `ClientProxy` per backend service (request/response RPC over RabbitMQ),
 * so any gateway feature can `@Inject(USER_SERVICE) private readonly client: ClientProxy`.
 * This is separate from `RabbitMQModule` (fire-and-forget pub/sub over a topic exchange) —
 * that module stays the pattern for domain events; this one is only for gateway → service calls.
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      { name: USER_SERVICE, imports: [ConfigModule], ...rmqClientFactory('USER_QUEUE', USER_QUEUE_DEFAULT) },
      {
        name: TUTOR_SERVICE,
        imports: [ConfigModule],
        ...rmqClientFactory('TUTOR_QUEUE', TUTOR_QUEUE_DEFAULT),
      },
      {
        name: THIRD_SERVICE,
        imports: [ConfigModule],
        ...rmqClientFactory('THIRD_QUEUE', THIRD_QUEUE_DEFAULT),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RmqClientsModule {}
