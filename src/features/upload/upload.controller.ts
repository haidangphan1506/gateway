import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiParam,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { StatusCodes } from 'http-status-codes';
import { Public } from '@packages/decorators';
import { sendRpc } from '@packages/helpers';
import { THIRD_SERVICE } from '../rmq-clients/rmq-clients.constants';

interface UploadRpcFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: { type: 'Buffer'; data: number[] };
}

interface DownloadRpcResult {
  content: { type: 'Buffer'; data: number[] };
  contentType: string;
  contentLength?: number;
  filename: string;
}

function serializeFile(file: Express.Multer.File): UploadRpcFile {
  return {
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    size: file.size,
    buffer: file.buffer.toJSON(),
  };
}

/**
 * Gateway is a thin HTTP edge for file uploads (Cloudflare R2): the multipart body is parsed
 * here, the file payload is forwarded to the `third-service` over RabbitMQ via `sendRpc`, and
 * binary download streams are reconstructed from the RPC result. No storage logic lives here.
 */
@ApiTags('Upload')
@ApiBearerAuth('access-token')
@Controller('upload')
export class UploadController {
  constructor(@Inject(THIRD_SERVICE) private readonly thirdClient: ClientProxy) {}

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Upload file', description: 'Upload a file to Cloudflare R2' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @SwaggerResponse({ status: 201, description: 'File uploaded' })
  upload(@UploadedFile() file: Express.Multer.File) {
    return sendRpc(this.thirdClient, 'upload.upload', { file: serializeFile(file) });
  }

  @Public()
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @SwaggerResponse({ status: 201, description: 'Files uploaded' })
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    return sendRpc(this.thirdClient, 'upload.uploadMultiple', {
      files: files.map(serializeFile),
    });
  }

  @Public()
  @Get('download')
  @ApiOperation({ summary: 'Download file', description: 'Stream a file from Cloudflare R2 by its key' })
  @ApiQuery({ name: 'key', required: true, description: 'R2 object key (e.g. uploads/uuid.jpg)' })
  @SwaggerResponse({ status: 200, description: 'File stream' })
  @SwaggerResponse({ status: 400, description: 'key query param missing' })
  @SwaggerResponse({ status: 404, description: 'File not found in R2' })
  async download(@Query('key') key: string, @Res() res: Response): Promise<void> {
    const result = await sendRpc<DownloadRpcResult>(this.thirdClient, 'upload.download', { key });
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    if (result.contentLength !== undefined) {
      res.setHeader('Content-Length', String(result.contentLength));
    }
    res.send(Buffer.from(result.content.data));
  }

  @Public()
  @Delete(':key')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Delete file' })
  @ApiParam({ name: 'key', type: String, description: 'R2 object key' })
  @SwaggerResponse({ status: 200, description: 'File deleted' })
  delete(@Param('key') key: string) {
    return sendRpc(this.thirdClient, 'upload.delete', { key });
  }
}