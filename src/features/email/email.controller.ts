import { Controller, Get, HttpCode, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { Public } from '@packages/decorators';
import { sendRpc } from '@packages/helpers';
import { THIRD_SERVICE } from '../rmq-clients/rmq-clients.constants';

/**
 * Gateway is a thin HTTP edge for `emails`: the handler forwards to the `third-service` over
 * RabbitMQ via `sendRpc`. No mail logic lives here.
 */
@ApiTags('Email')
@Controller('emails')
export class EmailController {
  constructor(@Inject(THIRD_SERVICE) private readonly thirdClient: ClientProxy) {}

  @Public()
  @Get()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Test email', description: 'Send a test email through the third-service' })
  @SwaggerResponse({ status: 200, description: 'Test email sent' })
  testSendEmail() {
    return sendRpc(this.thirdClient, 'email.test');
  }
}