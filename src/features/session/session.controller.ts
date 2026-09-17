import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices'; // commented out: RabbitMQ client removed
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
// import { sendRpc } from '@packages/helpers'; // commented out: RabbitMQ request helper removed
import type { JwtGuardUser } from '@packages/guards/jwt-auth.guard';
// import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants'; // commented out: RabbitMQ client removed

/**
 * Gateway is a thin HTTP edge for `sessions`: validation/guards/Swagger stay, every handler
 * forwards to the `tutor-service` over RabbitMQ via `sendRpc`.
 */
@ApiTags('Sessions')
@ApiBearerAuth('access-token')
@Controller('sessions')
export class SessionController {
  // constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}
  constructor() {}

  @Post()
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create session', description: 'Create a single class session' })
  @ApiBody({ schema: { type: 'object', required: ['classId', 'date', 'startTime', 'endTime'] } })
  @SwaggerResponse({ status: 201, description: 'Session created' })
  create(
    @Body(new ZodValidationPipe<CreateSessionDto>(createSessionSchema))
    _dto: CreateSessionDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'session.create', { userId: user?.id, data: dto }); // commented out: RabbitMQ request disabled
    throw new Error('session.create is disabled — RabbitMQ request commented out');
  }

  @Post('bulk')
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create sessions (bulk)', description: 'Create up to 50 class sessions at once' })
  @SwaggerResponse({ status: 201, description: 'Sessions created' })
  createBulk(
    @Body(new ZodValidationPipe<CreateSessionsDto>(createSessionsSchema))
    _dto: CreateSessionsDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'session.createBulk', { userId: user?.id, data: dto }); // commented out: RabbitMQ request disabled
    throw new Error('session.createBulk is disabled — RabbitMQ request commented out');
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
    _query: GetSessionsQueryDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'session.getAll', { userId: user?.id, query }); // commented out: RabbitMQ request disabled
    throw new Error('session.getAll is disabled — RabbitMQ request commented out');
  }

  @Get('class/:classId')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get sessions by class' })
  @ApiParam({ name: 'classId', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Sessions fetched' })
  getByClass(@Param('classId') _classId: string, @CurrentUser() _user: JwtGuardUser) {
    // return sendRpc(this.tutorClient, 'session.getByClass', { userId: user?.id, classId }); // commented out: RabbitMQ request disabled
    throw new Error('session.getByClass is disabled — RabbitMQ request commented out');
  }

  @Get(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get session detail' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Session detail fetched' })
  getById(@Param('id') _id: string, @CurrentUser() _user: JwtGuardUser) {
    // return sendRpc(this.tutorClient, 'session.getById', { userId: user?.id, id }); // commented out: RabbitMQ request disabled
    throw new Error('session.getById is disabled — RabbitMQ request commented out');
  }

  @Put(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Update session' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Session updated' })
  update(
    @Param('id') _id: string,
    @Body(new ZodValidationPipe<UpdateSessionDto>(updateSessionSchema))
    _dto: UpdateSessionDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'session.update', { userId: user?.id, id, data: dto }); // commented out: RabbitMQ request disabled
    throw new Error('session.update is disabled — RabbitMQ request commented out');
  }

  @Delete(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Delete session' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Session deleted' })
  del(@Param('id') _id: string, @CurrentUser() _user: JwtGuardUser) {
    // return sendRpc(this.tutorClient, 'session.delete', { userId: user?.id, id }); // commented out: RabbitMQ request disabled
    throw new Error('session.delete is disabled — RabbitMQ request commented out');
  }
}