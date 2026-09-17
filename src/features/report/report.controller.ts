import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices'; // commented out: RabbitMQ client removed
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { Roles } from '@packages/decorators';
import { RolesGuard } from '@packages/guards';
import { ZodValidationPipe } from '@packages/pipes';
import {
  getLearningClassReportsQuerySchema,
  type GetLearningClassReportsQueryDto,
} from '@packages/entities/report';
// import { sendRpc } from '@packages/helpers'; // commented out: RabbitMQ request helper removed
// import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants'; // commented out: RabbitMQ client removed

/**
 * Gateway is a thin HTTP edge for `reports/learning` (admin only): guards/Swagger stay, every
 * handler forwards to the `tutor-service` over RabbitMQ via `sendRpc`.
 */
@ApiTags('Reports')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('reports/learning')
export class ReportController {
  // constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}
  constructor() {}

  @Get('summary')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: 'Learning report summary',
    description: 'Active classes, average attendance, curriculum progress and submission rate (admin only)',
  })
  @SwaggerResponse({ status: 200, description: 'Summary fetched' })
  getSummary() {
    // return sendRpc(this.tutorClient, 'report.summary'); // commented out: RabbitMQ request disabled
    throw new Error('report.summary is disabled — RabbitMQ request commented out');
  }

  @Get('attendance-trend')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: 'Attendance trend',
    description: 'Monthly attendance rate for the last 6 months (admin only)',
  })
  @SwaggerResponse({ status: 200, description: 'Attendance trend fetched' })
  getAttendanceTrend() {
    // return sendRpc(this.tutorClient, 'report.attendanceTrend'); // commented out: RabbitMQ request disabled
    throw new Error('report.attendanceTrend is disabled — RabbitMQ request commented out');
  }

  @Get('classes')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: 'Class report list',
    description: 'Paginated per-class report (attendance, curriculum progress, assignments) (admin only)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search name/code/subject' })
  @SwaggerResponse({ status: 200, description: 'Class reports fetched' })
  getClasses(
    @Query(
      new ZodValidationPipe<GetLearningClassReportsQueryDto>(getLearningClassReportsQuerySchema),
    )
    _query: GetLearningClassReportsQueryDto,
  ) {
    // return sendRpc(this.tutorClient, 'report.classList', { query }); // commented out: RabbitMQ request disabled
    throw new Error('report.classList is disabled — RabbitMQ request commented out');
  }
}