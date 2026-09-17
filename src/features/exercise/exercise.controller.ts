import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices'; // commented out: RabbitMQ client removed
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { ZodValidationPipe } from '@packages/pipes';
import { CurrentUser } from '@packages/decorators';
import {
  createExerciseSchema,
  getExerciseQuerySchema,
  gradeExerciseSchema,
  submitExerciseSchema,
  type CreateExerciseDto,
  type getExerciseDto,
  type GradeExerciseDto,
  type SubmitExerciseDto,
} from '@packages/entities/exercise';
// import { sendRpc } from '@packages/helpers'; // commented out: RabbitMQ request helper removed
import type { JwtGuardUser } from '@packages/guards/jwt-auth.guard';
// import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants'; // commented out: RabbitMQ client removed

/**
 * Gateway is a thin HTTP edge for `exercises`: validation/guards/Swagger stay, every handler
 * forwards to the `tutor-service` over RabbitMQ via `sendRpc`.
 */
@ApiTags('Exercises')
@ApiBearerAuth('access-token')
@Controller('exercises')
export class ExerciseController {
  // constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}
  constructor() {}

  @Post()
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create exercise', description: 'Submit an exercise for a session/lesson' })
  @SwaggerResponse({ status: 201, description: 'Exercise submitted' })
  create(
    @Body(new ZodValidationPipe<CreateExerciseDto>(createExerciseSchema))
    _dto: CreateExerciseDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'exercise.create', { userId: user?.id, data: dto }); // commented out: RabbitMQ request disabled
    throw new Error('exercise.create is disabled — RabbitMQ request commented out');
  }

  @Get()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: 'Get exercises',
    description: 'List exercises the current user owns (tutor) or submitted (student)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sessionId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'studentId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'classId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'tutorId', required: false, type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Exercises fetched' })
  getAll(
    @Query(new ZodValidationPipe<getExerciseDto>(getExerciseQuerySchema))
    _query: getExerciseDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'exercise.getAll', { userId: user?.id, query }); // commented out: RabbitMQ request disabled
    throw new Error('exercise.getAll is disabled — RabbitMQ request commented out');
  }

  @Get(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get exercise detail' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Exercise fetched' })
  getById(@Param('id') _id: string, @CurrentUser() _user: JwtGuardUser) {
    // return sendRpc(this.tutorClient, 'exercise.getById', { userId: user?.id, id }); // commented out: RabbitMQ request disabled
    throw new Error('exercise.getById is disabled — RabbitMQ request commented out');
  }

  @Patch(':id/submit')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Submit exercise', description: 'Re-submit the files of an existing (ungraded) exercise' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Exercise re-submitted' })
  submit(
    @Param('id') _id: string,
    @Body(new ZodValidationPipe<SubmitExerciseDto>(submitExerciseSchema))
    _dto: SubmitExerciseDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'exercise.submit', { userId: user?.id, id, data: dto }); // commented out: RabbitMQ request disabled
    throw new Error('exercise.submit is disabled — RabbitMQ request commented out');
  }

  @Patch(':id/grade')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Grade exercise', description: 'Grade an exercise submission (score 0-10 + comment)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Exercise graded' })
  grade(
    @Param('id') _id: string,
    @Body(new ZodValidationPipe<GradeExerciseDto>(gradeExerciseSchema))
    _dto: GradeExerciseDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'exercise.grade', { userId: user?.id, id, data: dto }); // commented out: RabbitMQ request disabled
    throw new Error('exercise.grade is disabled — RabbitMQ request commented out');
  }
}