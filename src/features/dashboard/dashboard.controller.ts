import { Controller, Get, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { CurrentUser } from '@packages/decorators';
import type { JwtGuardUser } from '@packages/guards/jwt-auth.guard';
import { KafkaProducer } from '../kafka/kafka.producer';

/**
 * Gateway is a thin HTTP edge for `dashboard`: guards/Swagger stay, every handler forwards to
 * the `tutor-service` over Kafka via `KafkaProducer.send()`.
 */
@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly kafkaProducer: KafkaProducer) {}

  @Get('overview')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: 'Get dashboard overview',
    description: 'Role-aware aggregate: stats, today schedule, monthly revenue/sessions and recent notifications',
  })
  @SwaggerResponse({ status: 200, description: 'Dashboard overview fetched' })
  overview(@CurrentUser() user: JwtGuardUser) {
    return this.kafkaProducer.send('dashboard.overview', { userId: user.id });
  }
}
