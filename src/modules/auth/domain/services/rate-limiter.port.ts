export interface RateLimiterPort {
  isBlocked(key: string): Promise<boolean>;
  registerAttempt(key: string): Promise<void>;
}
