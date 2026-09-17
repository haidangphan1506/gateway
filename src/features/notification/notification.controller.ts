import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
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
  createNotificationSchema,
  getNotificationsQuerySchema,
  type CreateNotificationDto,
  type GetNotificationsQueryDto,
} from '@packages/entities/notification';
// import { sendRpc } from '@packages/helpers'; // commented out: RabbitMQ request helper removed
import type { JwtGuardUser } from '@packages/guards/jwt-auth.guard';
// import { THIRD_SERVICE } from '../rmq-clients/rmq-clients.constants'; // commented out: RabbitMQ client removed

/**
 * Gateway is a thin HTTP edge for `notifications`: validation/guards/Swagger stay, every handler
 * forwards to the `third-service` over RabbitMQ via `sendRpc`.
 */
@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationController {
  // constructor(@Inject(THIRD_SERVICE) private readonly thirdClient: ClientProxy) {}
  constructor() {}

  @Post()
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create notification' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['type', 'title'],
      properties: {
        type: { type: 'string', enum: ['SYSTEM', 'TUITION', 'STUDENT', 'TUTOR'], example: 'SYSTEM' },
        title: { type: 'string', maxLength: 255, example: 'Cap nhat tinh nang moi' },
        content: { type: 'string', example: 'Da them chuc nang quan ly bai tap' },
        subContent: { type: 'string', example: 'Chưa cập nhật ...' },
        userId: { type: 'string', format: 'uuid', nullable: true },
        classId: { type: 'string', format: 'uuid', nullable: true },
        studentId: { type: 'string', format: 'uuid', nullable: true },
      },
    },
  })
  @SwaggerResponse({ status: 201, description: 'Notification created' })
  create(
    @Body(new ZodValidationPipe<CreateNotificationDto>(createNotificationSchema))
    _dto: CreateNotificationDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.thirdClient, 'notification.create', { ...dto, senderId: user.id }); // commented out: RabbitMQ request disabled
    throw new Error('notification.create is disabled — RabbitMQ request commented out');
  }

  @Get()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get all notifications for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by title' })
  @ApiQuery({ name: 'type', required: false, enum: ['SYSTEM', 'TUITION', 'STUDENT', 'TUTOR'] })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @SwaggerResponse({ status: 200, description: 'Notifications fetched' })
  getAll(
    @Query(new ZodValidationPipe<GetNotificationsQueryDto>(getNotificationsQuerySchema))
    _query: GetNotificationsQueryDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.thirdClient, 'notification.getAll', { userId: user.id, query }); // commented out: RabbitMQ request disabled
    throw new Error('notification.getAll is disabled — RabbitMQ request commented out');
  }

  @Patch('read-all')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Mark all as read', description: 'Mark all notifications as read for the current user' })
  @SwaggerResponse({ status: 200, description: 'All marked as read' })
  markAllAsRead(@CurrentUser() _user: JwtGuardUser) {
    // return sendRpc(this.thirdClient, 'notification.markAllAsRead', { userId: user.id }); // commented out: RabbitMQ request disabled
    throw new Error('notification.markAllAsRead is disabled — RabbitMQ request commented out');
  }

  @Get(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get notification detail' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: 200, description: 'Notification detail' })
  getById(@Param('id') _id: string) {
    // return sendRpc(this.thirdClient, 'notification.getById', { id }); // commented out: RabbitMQ request disabled
    throw new Error('notification.getById is disabled — RabbitMQ request commented out');
  }

  @Patch(':id/read')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: 200, description: 'Marked as read' })
  markAsRead(@Param('id') _id: string) {
    // return sendRpc(this.thirdClient, 'notification.markAsRead', { id }); // commented out: RabbitMQ request disabled
    throw new Error('notification.markAsRead is disabled — RabbitMQ request commented out');
  }

  @Delete(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: 200, description: 'Notification deleted' })
  delete(@Param('id') _id: string) {
    // return sendRpc(this.thirdClient, 'notification.delete', { id }); // commented out: RabbitMQ request disabled
    throw new Error('notification.delete is disabled — RabbitMQ request commented out');
  }
}