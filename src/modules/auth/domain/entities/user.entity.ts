import { InvalidUserNameError } from '../errors/invalid-user-name.error';
import { Email } from '../value-objects/email.vo';

export interface UserProps {
  id: string;
  name: string;
  email: Email;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  passwordChangedAt?: Date | null;
}

export class User {
  private constructor(private readonly props: UserProps) {
    this.validate();
  }

  static create(props: UserProps): User {
    return new User(props);
  }

  private validate(): void {
    if (!this.props.name.trim()) {
      throw new InvalidUserNameError();
    }
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get passwordChangedAt(): Date | null {
    return this.props.passwordChangedAt ?? null;
  }

  // A login (JWT) issued before the last password change is no longer valid.
  // `issuedAtSeconds` is the JWT `iat` (whole seconds), so the change moment is
  // compared by its second: the login issued with the change in Account, in
  // that same second, stays valid.
  acceptsSessionIssuedAt(issuedAtSeconds: number): boolean {
    const passwordChangedAt = this.passwordChangedAt;

    if (!passwordChangedAt) {
      return true;
    }

    return issuedAtSeconds >= Math.floor(passwordChangedAt.getTime() / 1000);
  }
}
