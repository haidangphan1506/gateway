import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { ZodValidationPipe } from '@packages/pipes';
import { CurrentUser } from '@packages/decorators';
import {
  createSessionSchema,
  createSessionsSchema,
  getSessionsSchema,
  updateSessionSchema,
  type CreateSessionDto,
  type CreateSessionsDto,
  type GetSessionsQueryDto,
  type UpdateSessionDto,
} from '@packages/entities/session';
import { sendRpc } from '@packages/helpers';
import type { JwtGuardUser } from '@packages/guards/jwt-auth.guard';
import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants';

/**
 * Gateway is a thin HTTP edge for `sessions`: validation/guards/Swagger stay, every handler
 * forwards to the `tutor-service` over RabbitMQ via `sendRpc`.
 */
@ApiTags('Sessions')
@ApiBearerAuth('access-token')
@Controller('sessions')
export class SessionController {
  constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}

  @Post()
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create session', description: 'Create a single class session' })
  @ApiBody({ schema: { type: 'object', required: ['classId', 'date', 'startTime', 'endTime'] } })
  @SwaggerResponse({ status: 201, description: 'Session created' })
  create(
    @Body(new ZodValidationPipe<CreateSessionDto>(createSessionSchema))
    dto: CreateSessionDto,
    @CurrentUser() user: JwtGuardUser,
  ) {
    return sendRpc(this.tutorClient, 'session.create', { userId: user?.id, data: dto });
  }

  @Post('bulk')
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create sessions (bulk)', description: 'Create up to 50 class sessions at once' })
  @SwaggerResponse({ status: 201, description: 'Sessions created' })
  createBulk(
    @Body(new ZodValidationPipe<CreateSessionsDto>(createSessionsSchema))
    dto: CreateSessionsDto,
    @CurrentUser() user: JwtGuardUser,
  ) {
    return sendRpc(this.tutorClient, 'session.createBulk', { userId: user?.id, data: dto });
  }

  @Get()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: 'Get sessions',
    description: 'List sessions across the classes the current user owns or is enrolled in',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'POSTPONED'],
  })
  @ApiQuery({ name: 'classId', required: false, type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Sessions fetched' })
  getAll(
    @Query(new ZodValidationPipe<GetSessionsQueryDto>(getSessionsSchema))
    query: GetSessionsQueryDto,
    @CurrentUser() user: JwtGuardUser,
  ) {
    return sendRpc(this.tutorClient, 'session.getAll', { userId: user?.id, query });
  }

  @Get('class/:classId')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get sessions by class' })
  @ApiParam({ name: 'classId', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Sessions fetched' })
  getByClass(@Param('classId') classId: string, @CurrentUser() user: JwtGuardUser) {
    return sendRpc(this.tutorClient, 'session.getByClass', { userId: user?.id, classId });
  }

  @Get(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get session detail' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Session detail fetched' })
  getById(@Param('id') id: string, @CurrentUser() user: JwtGuardUser) {
    return sendRpc(this.tutorClient, 'session.getById', { userId: user?.id, id });
  }

  @Put(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Update session' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Session updated' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe<UpdateSessionDto>(updateSessionSchema))
    dto: UpdateSessionDto,
    @CurrentUser() user: JwtGuardUser,
  ) {
    return sendRpc(this.tutorClient, 'session.update', { userId: user?.id, id, data: dto });
  }

  @Delete(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Delete session' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Session deleted' })
  del(@Param('id') id: string, @CurrentUser() user: JwtGuardUser) {
    return sendRpc(this.tutorClient, 'session.delete', { userId: user?.id, id });
  }
}