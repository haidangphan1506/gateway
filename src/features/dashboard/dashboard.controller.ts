import { Controller, Get, HttpCode, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { CurrentUser } from '@packages/decorators';
import { sendRpc } from '@packages/helpers';
import type { JwtGuardUser } from '@packages/guards/jwt-auth.guard';
import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants';

/**
 * Gateway is a thin HTTP edge for `dashboard`: guards/Swagger stay, every handler forwards to
 * the `tutor-service` over RabbitMQ via `sendRpc`.
 */
@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
  constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}

  @Get('overview')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: 'Get dashboard overview',
    description: 'Role-aware aggregate: stats, today schedule, monthly revenue/sessions and recent notifications',
  })
  @SwaggerResponse({ status: 200, description: 'Dashboard overview fetched' })
  overview(@CurrentUser() user: JwtGuardUser) {
    return sendRpc(this.tutorClient, 'dashboard.overview', { userId: user.id });
  }
}