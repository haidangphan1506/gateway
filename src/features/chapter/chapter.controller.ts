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
  createChapterSchema,
  getChaptersQuerySchema,
  updateChapterSchema,
  type CreateChapterDto,
  type GetChaptersQueryDto,
  type UpdateChapterDto,
} from '@packages/entities/curriculum';
// import { sendRpc } from '@packages/helpers'; // commented out: RabbitMQ request helper removed
// import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants'; // commented out: RabbitMQ client removed

/**
 * Gateway is a thin HTTP edge for `chapter`: validation/guards/Swagger stay, every handler
 * forwards to the `tutor-service` over RabbitMQ via `sendRpc`.
 */
@ApiTags('Chapter')
@ApiBearerAuth('access-token')
@Controller('chapter')
export class ChapterController {
  // constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}
  constructor() {}

  @Post(':curriculumId')
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create chapter', description: 'Create a new chapter for a curriculum' })
  @ApiParam({ name: 'curriculumId', description: 'Curriculum ID', type: 'string' })
  @ApiBody({ schema: { type: 'object', required: ['title'] } })
  @SwaggerResponse({ status: 201, description: 'Chapter created' })
  create(
    @Param('curriculumId') _curriculumId: string,
    @Body(new ZodValidationPipe<CreateChapterDto>(createChapterSchema))
    _data: CreateChapterDto,
  ) {
    // return sendRpc(this.tutorClient, 'chapter.create', { curriculumId, data }); // commented out: RabbitMQ request disabled
    throw new Error('chapter.create is disabled — RabbitMQ request commented out');
  }

  @Get()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get all chapters', description: 'Get all chapters for a curriculum' })
  @ApiQuery({ name: 'curriculumId', description: 'Curriculum ID', type: 'string', required: true })
  @ApiQuery({ name: 'page', description: 'Page number', type: 'number', required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', type: 'number', required: false })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Chapters fetched' })
  getAll(
    @Query(new ZodValidationPipe<GetChaptersQueryDto>(getChaptersQuerySchema))
    _query: GetChaptersQueryDto,
  ) {
    // return sendRpc(this.tutorClient, 'chapter.getAll', { query }); // commented out: RabbitMQ request disabled
    throw new Error('chapter.getAll is disabled — RabbitMQ request commented out');
  }

  @Get(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get chapter by id' })
  @ApiParam({ name: 'id', description: 'Chapter ID', type: 'string' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Chapter fetched' })
  getById(@Param('id') _id: string) {
    // return sendRpc(this.tutorClient, 'chapter.getById', { id }); // commented out: RabbitMQ request disabled
    throw new Error('chapter.getById is disabled — RabbitMQ request commented out');
  }

  @Put(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Update chapter' })
  @ApiParam({ name: 'id', description: 'Chapter ID', type: 'string' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Chapter updated' })
  update(
    @Param('id') _id: string,
    @Body(new ZodValidationPipe<UpdateChapterDto>(updateChapterSchema))
    _data: UpdateChapterDto,
  ) {
    // return sendRpc(this.tutorClient, 'chapter.update', { id, data }); // commented out: RabbitMQ request disabled
    throw new Error('chapter.update is disabled — RabbitMQ request commented out');
  }

  @Delete(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Delete chapter' })
  @ApiParam({ name: 'id', description: 'Chapter ID', type: 'string' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Chapter deleted' })
  delete(@Param('id') _id: string) {
    // return sendRpc(this.tutorClient, 'chapter.delete', { id }); // commented out: RabbitMQ request disabled
    throw new Error('chapter.delete is disabled — RabbitMQ request commented out');
  }
}