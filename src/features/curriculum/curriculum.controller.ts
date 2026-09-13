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
  createCurriculumSchema,
  getCurriculumsQuerySchema,
  updateCurriculumSchema,
  type CreateCurriculumDto,
  type GetCurriculumsQueryDto,
  type UpdateCurriculumDto,
} from '@packages/entities/curriculum';
import { sendRpc } from '@packages/helpers';
import type { JwtGuardUser } from '@packages/guards/jwt-auth.guard';
import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants';

/**
 * Gateway is a thin HTTP edge for `curriculum`: validation/guards/Swagger stay, every handler
 * forwards to the `tutor-service` over RabbitMQ via `sendRpc`.
 */
@ApiTags('Curriculum')
@ApiBearerAuth('access-token')
@Controller('curriculum')
export class CurriculumController {
  constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}

  @Get('generate-code')
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Generate curriculum code' })
  @SwaggerResponse({ status: 201, description: 'Curriculum code generated' })
  generateCode() {
    return sendRpc(this.tutorClient, 'curriculum.generateCode');
  }

  @Post()
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create curriculum' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['subject', 'code', 'grade'],
      properties: {
        subject: { type: 'string', example: 'Đại Số' },
        code: { type: 'string', example: 'FDV643' },
        grade: { type: 'string', example: '12' },
        courseTime: { type: 'string', example: '12 buổi' },
        description: { type: 'string', example: '' },
        gradesId: { type: 'string', format: 'uuid' },
      },
    },
  })
  @SwaggerResponse({ status: 201, description: 'Curriculum created' })
  create(
    @Body(new ZodValidationPipe<CreateCurriculumDto>(createCurriculumSchema))
    dto: CreateCurriculumDto,
    @CurrentUser() user: JwtGuardUser,
  ) {
    return sendRpc(this.tutorClient, 'curriculum.create', {
      userId: user.id,
      createCurriculum: dto,
    });
  }

  @Get()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get all curriculum' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by subject or code' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Curriculum list fetched' })
  getAll(
    @Query(new ZodValidationPipe<GetCurriculumsQueryDto>(getCurriculumsQuerySchema))
    query: GetCurriculumsQueryDto,
    @CurrentUser() user: JwtGuardUser,
  ) {
    return sendRpc(this.tutorClient, 'curriculum.getAll', { userId: user.id, query });
  }

  @Get(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get curriculum by id' })
  @ApiParam({ name: 'id', description: 'Curriculum ID', type: 'string' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Curriculum detail fetched' })
  getById(@Param('id') id: string, @CurrentUser() user: JwtGuardUser) {
    return sendRpc(this.tutorClient, 'curriculum.getById', { userId: user.id, id });
  }

  @Put(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Update curriculum' })
  @ApiParam({ name: 'id', description: 'Curriculum ID', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', example: 'Đại Số' },
        code: { type: 'string', example: 'FDV643' },
        grade: { type: 'string', example: '12' },
        description: { type: 'string', example: '' },
      },
    },
  })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Curriculum updated' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe<UpdateCurriculumDto>(updateCurriculumSchema))
    dto: UpdateCurriculumDto,
    @CurrentUser() user: JwtGuardUser,
  ) {
    return sendRpc(this.tutorClient, 'curriculum.update', {
      userId: user?.id,
      id,
      data: dto,
    });
  }

  @Delete(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Delete curriculum' })
  @ApiParam({ name: 'id', description: 'Curriculum ID', type: 'string' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Curriculum deleted' })
  delete(@Param('id') id: string, @CurrentUser() user: JwtGuardUser) {
    return sendRpc(this.tutorClient, 'curriculum.delete', { userId: user.id, id });
  }
}