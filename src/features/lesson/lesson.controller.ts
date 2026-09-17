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
import {
  createLessonBodySchema,
  getLessonsQuerySchema,
  updateLessonSchema,
  type CreateLessonBodyDto,
  type GetLessonsQueryDto,
  type UpdateLessonDto,
} from '@packages/entities/curriculum';
// import { sendRpc } from '@packages/helpers'; // commented out: RabbitMQ request helper removed
// import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants'; // commented out: RabbitMQ client removed

/**
 * Gateway is a thin HTTP edge for `lesson`: validation/guards/Swagger stay, every handler
 * forwards to the `tutor-service` over RabbitMQ via `sendRpc`.
 */
@ApiTags('Lesson')
@ApiBearerAuth('access-token')
@Controller('curriculum/lessons')
export class LessonController {
  // constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}
  constructor() {}

  @Post()
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create lesson', description: 'Create a new lesson' })
  @ApiQuery({ name: 'curriculumId', description: 'Curriculum ID', type: 'string' })
  @ApiQuery({ name: 'chapterId', description: 'Chapter ID (optional)', type: 'string', required: false })
  @ApiBody({ schema: { type: 'object', required: ['title'] } })
  @SwaggerResponse({ status: 201, description: 'Lesson created' })
  create(
    @Query('curriculumId') _curriculumId: string,
    @Query('chapterId') _chapterId: string | undefined,
    @Body(new ZodValidationPipe<CreateLessonBodyDto>(createLessonBodySchema))
    _data: CreateLessonBodyDto,
  ) {
    // return sendRpc(this.tutorClient, 'lesson.create', { curriculumId, chapterId, data }); // commented out: RabbitMQ request disabled
    throw new Error('lesson.create is disabled — RabbitMQ request commented out');
  }

  @Get()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: 'Get all lessons',
    description: 'Get lessons filtered by curriculumId and optionally chapterId',
  })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Lessons fetched' })
  getAll(
    @Query(new ZodValidationPipe<GetLessonsQueryDto>(getLessonsQuerySchema))
    _query: GetLessonsQueryDto,
  ) {
    // return sendRpc(this.tutorClient, 'lesson.getAll', { query }); // commented out: RabbitMQ request disabled
    throw new Error('lesson.getAll is disabled — RabbitMQ request commented out');
  }

  @Get(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get lesson by id' })
  @ApiParam({ name: 'id', description: 'Lesson ID', type: 'string' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Lesson fetched' })
  getById(@Param('id') _id: string) {
    // return sendRpc(this.tutorClient, 'lesson.getById', { id }); // commented out: RabbitMQ request disabled
    throw new Error('lesson.getById is disabled — RabbitMQ request commented out');
  }

  @Put(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Update lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID', type: 'string' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Lesson updated' })
  update(
    @Param('id') _id: string,
    @Body(new ZodValidationPipe<UpdateLessonDto>(updateLessonSchema))
    _data: UpdateLessonDto,
  ) {
    // return sendRpc(this.tutorClient, 'lesson.update', { id, data }); // commented out: RabbitMQ request disabled
    throw new Error('lesson.update is disabled — RabbitMQ request commented out');
  }

  @Delete(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Delete lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID', type: 'string' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Lesson deleted' })
  delete(@Param('id') _id: string) {
    // return sendRpc(this.tutorClient, 'lesson.delete', { id }); // commented out: RabbitMQ request disabled
    throw new Error('lesson.delete is disabled — RabbitMQ request commented out');
  }
}