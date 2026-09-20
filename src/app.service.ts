import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor() {}

  async onModuleInit() {}

  getHello(): string {
    return 'Hello World!';
  }
}
