import { z } from 'zod';

export const getRedisQuerySchema = z.object({
  key: z.string().min(1, 'key query param is required'),
});