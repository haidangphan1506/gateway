import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
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
  changePasswordSchema,
  getUsersQuerySchema,
  type ChangePasswordValues,
  type CreateUserDto,
  type CreateUserResponseDto,
  createUserSchema,
  dataFieldSchema,
  type GetUsersQueryDto,
  type UpdateUserDto,
  updateUserSchema,
  type UserDataFieldDto,
} from '@packages/entities/user';
import { sendRpc } from '@packages/helpers';
import type { JwtGuardUser } from '@packages/guards/jwt-auth.guard';
import { USER_SWAGGER_MESSAGES } from 'src/data/swaggers/messages';
import { USER_SWAGGERS_DATA } from 'src/data/swaggers/data/user.swagger';
import { USER_SERVICE } from '../rmq-clients/rmq-clients.constants';

/**
 * Gateway is a thin HTTP edge here: validation/guards/Swagger stay, every handler forwards to
 * the `user` service over RabbitMQ via `sendRpc` — no local business logic or DB access.
 */
@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserController {
  constructor(@Inject(USER_SERVICE) private readonly userClient: ClientProxy) {}

  @Get()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: USER_SWAGGER_MESSAGES.GET_USERS_SUCCESSFULLY,
    description: USER_SWAGGER_MESSAGES.GET_USERS_SUCCESSFULLY,
  })
  @ApiQuery(USER_SWAGGERS_DATA.GET_USERS_QUERY[0])
  @ApiQuery(USER_SWAGGERS_DATA.GET_USERS_QUERY[1])
  @ApiQuery(USER_SWAGGERS_DATA.GET_USERS_QUERY[2])
  @ApiQuery(USER_SWAGGERS_DATA.GET_USERS_QUERY[3])
  @ApiQuery(USER_SWAGGERS_DATA.GET_USERS_QUERY[4])
  @ApiQuery(USER_SWAGGERS_DATA.GET_USERS_QUERY[5])
  @SwaggerResponse({
    status: StatusCodes.OK,
    description: USER_SWAGGER_MESSAGES.GET_USERS_SUCCESSFULLY,
  })
  async getUsers(
    @Query(new ZodValidationPipe<GetUsersQueryDto>(getUsersQuerySchema))
    query: GetUsersQueryDto,
  ) {
    return sendRpc(this.userClient, 'user.getUsers', query);
  }

  @Get('/detail-user')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: USER_SWAGGER_MESSAGES.GET_USER_SUCCESSFULLY,
    description: USER_SWAGGER_MESSAGES.GET_USER_SUCCESSFULLY,
  })
  @SwaggerResponse({
    status: StatusCodes.OK,
    description: USER_SWAGGER_MESSAGES.GET_USER_SUCCESSFULLY,
  })
  async getDetailUserController(@CurrentUser() user: Record<string, string>) {
    return sendRpc(this.userClient, 'user.getDetailUser', { userId: user.id });
  }

  @Get('/get-by-field')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: USER_SWAGGER_MESSAGES.GET_USER_BY_FIELD_SUCCESSFULLY,
    description: USER_SWAGGER_MESSAGES.GET_USER_BY_FIELD_SUCCESSFULLY,
  })
  @ApiQuery(USER_SWAGGERS_DATA.GET_USER_BY_FIELD_QUERY[0])
  @ApiQuery(USER_SWAGGERS_DATA.GET_USER_BY_FIELD_QUERY[1])
  @SwaggerResponse({
    status: StatusCodes.OK,
    description: USER_SWAGGER_MESSAGES.GET_USER_BY_FIELD_SUCCESSFULLY,
  })
  async getUserByField(
    @Query(new ZodValidationPipe(dataFieldSchema))
    dataFieldDto: UserDataFieldDto,
  ): Promise<unknown> {
    return sendRpc(this.userClient, 'user.getUserByField', dataFieldDto);
  }

  @Post()
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({
    summary: USER_SWAGGER_MESSAGES.CREATE_USER_SUCCESSFULLY,
    description: USER_SWAGGER_MESSAGES.CREATE_USER_SUCCESSFULLY,
  })
  @ApiBody({ schema: USER_SWAGGERS_DATA.CREATE_USER_SCHEMA })
  @SwaggerResponse({
    status: StatusCodes.CREATED,
    description: USER_SWAGGER_MESSAGES.CREATE_USER_SUCCESSFULLY,
  })
  async createUser(
    @Body(new ZodValidationPipe(createUserSchema))
    createUserDto: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    return sendRpc(this.userClient, 'user.createUser', createUserDto);
  }

  @Put('')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: USER_SWAGGER_MESSAGES.UPDATE_USER_SUCCESSFULLY,
    description: USER_SWAGGER_MESSAGES.UPDATE_USER_SUCCESSFULLY,
  })
  @ApiBody({ schema: USER_SWAGGERS_DATA.UPDATE_USER_SCHEMA })
  @SwaggerResponse({
    status: StatusCodes.OK,
    description: USER_SWAGGER_MESSAGES.UPDATE_USER_SUCCESSFULLY,
  })
  async updateUserController(
    @CurrentUser() user: JwtGuardUser,
    @Body(new ZodValidationPipe<UpdateUserDto>(updateUserSchema))
    updateUserDto: UpdateUserDto,
  ) {
    return sendRpc(this.userClient, 'user.updateUser', {
      id: user.id,
      role: user.role,
      data: updateUserDto,
    });
  }

  @Put('/:id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: USER_SWAGGER_MESSAGES.UPDATE_USER_SUCCESSFULLY,
    description: USER_SWAGGER_MESSAGES.UPDATE_USER_SUCCESSFULLY,
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'User ID' })
  @ApiBody({ schema: USER_SWAGGERS_DATA.UPDATE_USER_SCHEMA })
  @SwaggerResponse({
    status: StatusCodes.OK,
    description: USER_SWAGGER_MESSAGES.UPDATE_USER_SUCCESSFULLY,
  })
  async updateUserByAdminController(
    @Param('id') id: string,
    @Body(new ZodValidationPipe<UpdateUserDto>(updateUserSchema))
    updateUserDto: UpdateUserDto,
  ) {
    return sendRpc(this.userClient, 'user.updateUserByAdmin', { id, data: updateUserDto });
  }

  @Put('/:id/status')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: USER_SWAGGER_MESSAGES.UPDATE_USER_STATUS_SUCCESSFULLY,
    description: USER_SWAGGER_MESSAGES.UPDATE_USER_STATUS_SUCCESSFULLY,
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'User ID' })
  @SwaggerResponse({
    status: StatusCodes.OK,
    description: USER_SWAGGER_MESSAGES.UPDATE_USER_STATUS_SUCCESSFULLY,
  })
  async updateStatusUserController(@Param('id') id: string) {
    return sendRpc(this.userClient, 'user.updateStatusUser', { id });
  }

  @Delete('/:id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: USER_SWAGGER_MESSAGES.DELETE_USER_SUCCESSFULLY,
    description: USER_SWAGGER_MESSAGES.DELETE_USER_SUCCESSFULLY,
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'User ID' })
  @SwaggerResponse({
    status: StatusCodes.OK,
    description: USER_SWAGGER_MESSAGES.DELETE_USER_SUCCESSFULLY,
  })
  async deleteUserByAdminController(@Param('id') id: string) {
    return sendRpc(this.userClient, 'user.deleteUserByAdmin', { id });
  }

  @Post('change-password')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({
    summary: USER_SWAGGER_MESSAGES.CHANGE_PASSWORD_SUCCESSFULLY,
    description: USER_SWAGGER_MESSAGES.CHANGE_PASSWORD_SUCCESSFULLY,
  })
  @ApiBody({ schema: USER_SWAGGERS_DATA.CHANGE_PASSWORD_SCHEMA })
  @SwaggerResponse({
    status: StatusCodes.OK,
    description: USER_SWAGGER_MESSAGES.CHANGE_PASSWORD_SUCCESSFULLY,
  })
  async changePasswordController(
    @CurrentUser() user: Record<string, string>,
    @Body(new ZodValidationPipe(changePasswordSchema))
    changePasswordDto: ChangePasswordValues,
  ) {
    return sendRpc(this.userClient, 'user.changePassword', {
      userId: user.id,
      data: changePasswordDto,
    });
  }
}
