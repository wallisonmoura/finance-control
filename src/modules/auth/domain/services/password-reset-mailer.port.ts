export interface PasswordResetLinkMessage {
  to: string;
  name: string;
  resetUrl: string;
}

export interface PasswordResetMailerPort {
  sendPasswordResetLink(message: PasswordResetLinkMessage): Promise<void>;
}
