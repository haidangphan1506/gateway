import { Body, Controller, Delete, Get, HttpCode, Post, Query } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices'; // commented out: RabbitMQ client removed
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { ZodValidationPipe } from '@packages/pipes';
import { CurrentUser } from '@packages/decorators';
import {
  chatSchema,
  getHistoryQuerySchema,
  type ChatDto,
  type GetHistoryQueryDto,
} from '@packages/entities/ai-chat';
// import { sendRpc } from '@packages/helpers'; // commented out: RabbitMQ request helper removed
import type { JwtGuardUser } from '@packages/guards/jwt-auth.guard';
// import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants'; // commented out: RabbitMQ client removed

/**
 * Gateway is a thin HTTP edge for the AI assistant (`ai-chat`): validation/guards/Swagger stay,
 * every handler forwards to the `tutor-service` agents feature over RabbitMQ via `sendRpc`.
 */
@ApiTags('AI Chat')
@ApiBearerAuth('access-token')
@Controller('ai-chat')
export class AiChatController {
  // constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}
  constructor() {}

  @Post('chat')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Chat with AI assistant', description: 'Send a message and get a reply (history is DB-backed)' })
  @ApiBody({ schema: { type: 'object', required: ['message'] } })
  @SwaggerResponse({ status: 200, description: 'AI reply fetched' })
  chat(
    @Body(new ZodValidationPipe<ChatDto>(chatSchema)) _dto: ChatDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'ai.chat', { userId: user.id, data: dto }); // commented out: RabbitMQ request disabled
    throw new Error('ai.chat is disabled — RabbitMQ request commented out');
  }

  @Get('history')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get AI chat history' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @SwaggerResponse({ status: 200, description: 'Chat history fetched' })
  getHistory(
    @Query(new ZodValidationPipe<GetHistoryQueryDto>(getHistoryQuerySchema))
    _query: GetHistoryQueryDto,
    @CurrentUser() _user: JwtGuardUser,
  ) {
    // return sendRpc(this.tutorClient, 'ai.history', { userId: user.id, query }); // commented out: RabbitMQ request disabled
    throw new Error('ai.history is disabled — RabbitMQ request commented out');
  }

  @Delete('history')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Clear AI chat history' })
  @SwaggerResponse({ status: 200, description: 'Chat history cleared' })
  clearHistory(@CurrentUser() _user: JwtGuardUser) {
    // return sendRpc(this.tutorClient, 'ai.clearHistory', { userId: user.id }); // commented out: RabbitMQ request disabled
    throw new Error('ai.clearHistory is disabled — RabbitMQ request commented out');
  }
}