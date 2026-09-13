import { Module } from '@nestjs/common';
import { ChapterController } from './chapter.controller';

@Module({
  controllers: [ChapterController],
})
export class ChapterModule {}