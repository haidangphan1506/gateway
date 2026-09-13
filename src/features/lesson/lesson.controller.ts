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
import {
  createLessonBodySchema,
  getLessonsQuerySchema,
  updateLessonSchema,
  type CreateLessonBodyDto,
  type GetLessonsQueryDto,
  type UpdateLessonDto,
} from '@packages/entities/curriculum';
import { sendRpc } from '@packages/helpers';
import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants';

/**
 * Gateway is a thin HTTP edge for `lesson`: validation/guards/Swagger stay, every handler
 * forwards to the `tutor-service` over RabbitMQ via `sendRpc`.
 */
@ApiTags('Lesson')
@ApiBearerAuth('access-token')
@Controller('curriculum/lessons')
export class LessonController {
  constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}

  @Post()
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create lesson', description: 'Create a new lesson' })
  @ApiQuery({ name: 'curriculumId', description: 'Curriculum ID', type: 'string' })
  @ApiQuery({ name: 'chapterId', description: 'Chapter ID (optional)', type: 'string', required: false })
  @ApiBody({ schema: { type: 'object', required: ['title'] } })
  @SwaggerResponse({ status: 201, description: 'Lesson created' })
  create(
    @Query('curriculumId') curriculumId: string,
    @Query('chapterId') chapterId: string | undefined,
    @Body(new ZodValidationPipe<CreateLessonBodyDto>(createLessonBodySchema))
    data: CreateLessonBodyDto,
  ) {
    return sendRpc(this.tutorClient, 'lesson.create', { curriculumId, chapterId, data });
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
    query: GetLessonsQueryDto,
  ) {
    return sendRpc(this.tutorClient, 'lesson.getAll', { query });
  }

  @Get(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get lesson by id' })
  @ApiParam({ name: 'id', description: 'Lesson ID', type: 'string' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Lesson fetched' })
  getById(@Param('id') id: string) {
    return sendRpc(this.tutorClient, 'lesson.getById', { id });
  }

  @Put(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Update lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID', type: 'string' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Lesson updated' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe<UpdateLessonDto>(updateLessonSchema))
    data: UpdateLessonDto,
  ) {
    return sendRpc(this.tutorClient, 'lesson.update', { id, data });
  }

  @Delete(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Delete lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID', type: 'string' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Lesson deleted' })
  delete(@Param('id') id: string) {
    return sendRpc(this.tutorClient, 'lesson.delete', { id });
  }
}