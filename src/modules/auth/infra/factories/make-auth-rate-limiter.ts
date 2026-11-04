import { RateLimiterPort } from '../../domain/services/rate-limiter.port';
import { PrismaRateLimiterAdapter } from '../services/prisma-rate-limiter.adapter';

export function makeAuthRateLimiter(): RateLimiterPort {
  return new PrismaRateLimiterAdapter();
}
