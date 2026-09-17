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
  createTuitionSchema,
  getTuitionsQuerySchema,
  updateTuitionSchema,
  type CreateTuitionDto,
  type GetTuitionsQueryDto,
  type UpdateTuitionDto,
} from '@packages/entities/tuition';
// import { sendRpc } from '@packages/helpers'; // commented out: RabbitMQ request helper removed
import type { JwtGuardUser } from '@packages/guards/jwt-auth.guard';
// import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants'; // commented out: RabbitMQ client removed

/**
 * Gateway is a thin HTTP edge for `tuitions`: validation/guards/Swagger stay, every handler
 * forwards to the `tutor-service` over RabbitMQ via `sendRpc`.
 */
@ApiTags('Tuitions')
@ApiBearerAuth('access-token')
@Controller('tuitions')
export class TuitionController {
  // constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}
  constructor() {}

  @Post()
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create tuition record' })
  @ApiBody({ schema: { type: 'object', required: ['classId', 'studentId', 'amount'] } })
  @SwaggerResponse({ status: 201, description: 'Tuition record created' })
  create(
    @Body(new ZodValidationPipe<CreateTuitionDto>(createTuitionSchema))
    _dto: CreateTuitionDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'tuition.create', { data: dto, userId: user.id }); // commented out: RabbitMQ request disabled
    throw new Error('tuition.create is disabled — RabbitMQ request commented out');
  }

  @Get('summary')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: 'Tuition summary',
    description: 'Get revenue summary (total paid/unpaid/overdue/revenue)',
  })
  @ApiQuery({ name: 'classId', required: false, type: String, format: 'uuid' })
  @SwaggerResponse({ status: 200, description: 'Summary fetched' })
  getSummary(@Query('classId') _classId?: string) {
    // return sendRpc(this.tutorClient, 'tuition.getSummary', classId); // commented out: RabbitMQ request disabled
    throw new Error('tuition.getSummary is disabled — RabbitMQ request commented out');
  }

  @Get()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'List tuition records' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'classId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'studentId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'status', required: false, enum: ['PAID', 'UNPAID', 'OVERDUE'] })
  @SwaggerResponse({ status: 200, description: 'Tuitions fetched' })
  getAll(
    @Query(new ZodValidationPipe<GetTuitionsQueryDto>(getTuitionsQuerySchema))
    _query: GetTuitionsQueryDto,
  ) {
    // return sendRpc(this.tutorClient, 'tuition.getAll', query); // commented out: RabbitMQ request disabled
    throw new Error('tuition.getAll is disabled — RabbitMQ request commented out');
  }

  @Get(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get tuition detail' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: 200, description: 'Tuition detail' })
  getById(@Param('id') _id: string) {
    // return sendRpc(this.tutorClient, 'tuition.getById', id); // commented out: RabbitMQ request disabled
    throw new Error('tuition.getById is disabled — RabbitMQ request commented out');
  }

  @Put(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Update tuition record' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: 200, description: 'Tuition updated' })
  update(
    @Param('id') _id: string,
    @Body(new ZodValidationPipe(updateTuitionSchema))
    _dto: UpdateTuitionDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'tuition.update', { id, data: dto, userId: user.id }); // commented out: RabbitMQ request disabled
    throw new Error('tuition.update is disabled — RabbitMQ request commented out');
  }

  @Delete(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Delete tuition record' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: 200, description: 'Tuition deleted' })
  delete(@Param('id') _id: string, @CurrentUser() _user: JwtGuardUser) {
    // return sendRpc(this.tutorClient, 'tuition.delete', { id, userId: user.id }); // commented out: RabbitMQ request disabled
    throw new Error('tuition.delete is disabled — RabbitMQ request commented out');
  }
}