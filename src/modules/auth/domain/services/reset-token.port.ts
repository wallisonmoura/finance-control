export interface GeneratedResetToken {
  // Goes only into the e-mail link.
  token: string;
  // The only form stored.
  tokenHash: string;
}

export interface ResetTokenPort {
  generate(): GeneratedResetToken;
  hash(token: string): string;
}
