import { RateLimiterPort } from '../../domain/services/rate-limiter.port';
import { PrismaLoginRateLimiterAdapter } from '../services/prisma-login-rate-limiter.adapter';

export function makeAuthRateLimiter(): RateLimiterPort {
  return new PrismaLoginRateLimiterAdapter();
}
