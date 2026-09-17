import { Controller, Get, HttpCode } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices'; // commented out: RabbitMQ client removed
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { Public } from '@packages/decorators';
// import { sendRpc } from '@packages/helpers'; // commented out: RabbitMQ request helper removed
// import { THIRD_SERVICE } from '../rmq-clients/rmq-clients.constants'; // commented out: RabbitMQ client removed

/**
 * Gateway is a thin HTTP edge for `emails`: the handler forwards to the `third-service` over
 * RabbitMQ via `sendRpc`. No mail logic lives here.
 */
@ApiTags('Email')
@Controller('emails')
export class EmailController {
  // constructor(@Inject(THIRD_SERVICE) private readonly thirdClient: ClientProxy) {}
  constructor() {}

  @Public()
  @Get()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Test email', description: 'Send a test email through the third-service' })
  @SwaggerResponse({ status: 200, description: 'Test email sent' })
  testSendEmail() {
    // return sendRpc(this.thirdClient, 'email.test'); // commented out: RabbitMQ request disabled
    throw new Error('email.test is disabled — RabbitMQ request commented out');
  }
}