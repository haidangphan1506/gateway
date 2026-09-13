import { Module } from '@nestjs/common';
import { TuitionController } from './tuition.controller';

@Module({
  controllers: [TuitionController],
})
export class TuitionModule {}