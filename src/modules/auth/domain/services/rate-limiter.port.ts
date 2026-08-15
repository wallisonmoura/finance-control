export interface RateLimiterPort {
  isBlocked(key: string): Promise<boolean>;
  registerFailedAttempt(key: string): Promise<void>;
}
