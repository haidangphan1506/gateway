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
  createClassSchema,
  getClassesQuerySchema,
  type AddStudentsDto,
  addStudentsSchema,
  type CreateClassDto,
  type GetClassesQueryDto,
  type UpdateClassDto,
  updateClassSchema,
} from '@packages/entities/class';
// import { sendRpc } from '@packages/helpers'; // commented out: RabbitMQ request helper removed
import type { JwtGuardUser } from '@packages/guards/jwt-auth.guard';
// import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants'; // commented out: RabbitMQ client removed

/**
 * Gateway is a thin HTTP edge for the education `class` domain: validation/guards/Swagger stay,
 * every handler forwards to the `tutor-service` over RabbitMQ via `sendRpc` — no local business
 * logic or DB access.
 */
@ApiTags('Classes')
@ApiBearerAuth('access-token')
@Controller('classes')
export class ClassController {
  // constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}
  constructor() {}

  @Post()
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create class', description: 'Create a new class (Stage 1: class info)' })
  @ApiBody({ schema: { type: 'object', required: ['name', 'subject', 'tutorId'] } })
  @SwaggerResponse({ status: 201, description: 'Class created' })
  create(
    @Body(new ZodValidationPipe<CreateClassDto>(createClassSchema))
    _dto: CreateClassDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'class.create', { data: dto, userId: user.id }); // commented out: RabbitMQ request disabled
    throw new Error('class.create is disabled — RabbitMQ request commented out');
  }

  @Put(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: 'Update class',
    description: "Update a class's info and/or reconcile its enrolled students",
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: 200, description: 'Class updated' })
  update(
    @Param('id') _id: string,
    @Body(new ZodValidationPipe<UpdateClassDto>(updateClassSchema))
    _dto: UpdateClassDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'class.update', { userId: user.id, id, data: dto }); // commented out: RabbitMQ request disabled
    throw new Error('class.update is disabled — RabbitMQ request commented out');
  }

  @Get('generate-code')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Generate class code', description: 'Generate a unique, unused class code' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Class code generated' })
  generateCode() {
    // return sendRpc(this.tutorClient, 'class.generateCode'); // commented out: RabbitMQ request disabled
    throw new Error('class.generateCode is disabled — RabbitMQ request commented out');
  }

  @Get()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get classes', description: 'Get and filter classes' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'CLOSED', 'UPCOMING'] })
  @ApiQuery({ name: 'subject', required: false, type: String })
  @ApiQuery({ name: 'studentsId', required: false, type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Class list fetched' })
  getAll(
    @Query(new ZodValidationPipe<GetClassesQueryDto>(getClassesQuerySchema))
    _query: GetClassesQueryDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'class.getAll', { userId: user?.id, query }); // commented out: RabbitMQ request disabled
    throw new Error('class.getAll is disabled — RabbitMQ request commented out');
  }

  @Get(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get class detail' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Class detail fetched' })
  getById(@Param('id') _id: string, @CurrentUser() _user: JwtGuardUser) {
    // return sendRpc(this.tutorClient, 'class.getById', { userId: user?.id, id }); // commented out: RabbitMQ request disabled
    throw new Error('class.getById is disabled — RabbitMQ request commented out');
  }

  @Post(':id/students')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Add students', description: 'Enroll one student or many students into a single class' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Students added' })
  addStudents(
    @Param('id') _id: string,
    @Body(new ZodValidationPipe<AddStudentsDto>(addStudentsSchema))
    _dto: AddStudentsDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'class.addStudents', { // commented out: RabbitMQ request disabled
    //   userId: user?.id,
    //   classId: id,
    //   data: dto,
    // });
    throw new Error('class.addStudents is disabled — RabbitMQ request commented out');
  }

  @Get(':id/students')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get students in class' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Students fetched' })
  getStudents(@Param('id') _id: string, @CurrentUser() _user: JwtGuardUser) {
    // return sendRpc(this.tutorClient, 'class.getStudents', { userId: user?.id, id }); // commented out: RabbitMQ request disabled
    throw new Error('class.getStudents is disabled — RabbitMQ request commented out');
  }

  @Get(':id/materials')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get class materials', description: 'List theory & exercise files of a class' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Class materials retrieved' })
  getMaterials(@Param('id') _id: string, @CurrentUser() _user: JwtGuardUser) {
    // return sendRpc(this.tutorClient, 'class.getMaterials', { userId: user?.id, id }); // commented out: RabbitMQ request disabled
    throw new Error('class.getMaterials is disabled — RabbitMQ request commented out');
  }

  @Get(':id/watches')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: 'Get class watch overview',
    description: 'Aggregated class overview for the STUDENT/PARENT read-only page',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Class watch overview retrieved' })
  getWatch(@Param('id') _id: string, @CurrentUser() _user: JwtGuardUser) {
    // return sendRpc(this.tutorClient, 'class.getWatch', { userId: user?.id, id }); // commented out: RabbitMQ request disabled
    throw new Error('class.getWatch is disabled — RabbitMQ request commented out');
  }

  @Delete(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Delete class' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: StatusCodes.OK, description: 'Class deleted' })
  del(@Param('id') _id: string, @CurrentUser() _user: JwtGuardUser) {
    // return sendRpc(this.tutorClient, 'class.delete', { userId: user?.id, id }); // commented out: RabbitMQ request disabled
    throw new Error('class.delete is disabled — RabbitMQ request commented out');
  }
}