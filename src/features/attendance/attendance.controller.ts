import { Body, Controller, Get, HttpCode, Param, Put } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices'; // commented out: RabbitMQ client removed
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { ZodValidationPipe } from '@packages/pipes';
import { CurrentUser } from '@packages/decorators';
import {
  upsertAttendanceSchema,
  type UpsertAttendanceDto,
} from '@packages/entities/attendance';
// import { sendRpc } from '@packages/helpers'; // commented out: RabbitMQ request helper removed
import type { JwtGuardUser } from '@packages/guards/jwt-auth.guard';
// import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants'; // commented out: RabbitMQ client removed

/**
 * Gateway is a thin HTTP edge for `attendance`: validation/guards/Swagger stay, every handler
 * forwards to the `tutor-service` over RabbitMQ via `sendRpc`.
 */
@ApiTags('Attendance')
@ApiBearerAuth('access-token')
@Controller('attendances')
export class AttendanceController {
  // constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}
  constructor() {}

  @Get('session/:sessionId')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: 'Get attendance',
    description: 'List a session roster merged with each student attendance record',
  })
  @ApiParam({ name: 'sessionId', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Attendance fetched' })
  getBySession(@Param('sessionId') _sessionId: string, @CurrentUser() _user: JwtGuardUser) {
    // return sendRpc(this.tutorClient, 'attendance.getBySession', { userId: user?.id, sessionId }); // commented out: RabbitMQ request disabled
    throw new Error('attendance.getBySession is disabled — RabbitMQ request commented out');
  }

  @Put()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: 'Mark attendance',
    description: "Mark or update a single student's attendance for a session (upsert)",
  })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Attendance marked' })
  upsert(
    @Body(new ZodValidationPipe<UpsertAttendanceDto>(upsertAttendanceSchema))
    _dto: UpsertAttendanceDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'attendance.upsert', { userId: user?.id, data: dto }); // commented out: RabbitMQ request disabled
    throw new Error('attendance.upsert is disabled — RabbitMQ request commented out');
  }
}