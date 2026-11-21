export interface CreatePasswordResetTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

// Password reset links. Only the token's hash is stored.
export interface PasswordResetTokenRepository {
  create(data: CreatePasswordResetTokenData): Promise<void>;
  // Invalidates the account's pending links and creates the new one, as one
  // step per account: two requests at the same time never leave two valid
  // links.
  replacePending(data: CreatePasswordResetTokenData, now: Date): Promise<void>;
  countCreatedSince(userId: string, since: Date): Promise<number>;
  // Makes every unused token of the user unusable.
  invalidatePending(userId: string, now: Date): Promise<void>;
  // Marks the token as used if it is still unused and not expired, and returns
  // its user. Returns null otherwise; of two simultaneous calls, one wins.
  consume(tokenHash: string, now: Date): Promise<string | null>;
}
