import { z } from 'zod';
import { getRedisQuerySchema } from './redis.schema';

export type GetRedisQueryDto = z.infer<typeof getRedisQuerySchema>;