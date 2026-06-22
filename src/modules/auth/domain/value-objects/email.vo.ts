import { InvalidEmailError } from '../errors/invalid-email.error';

export class Email {
  private constructor(private readonly value: string) {}

  public static create(value: string): Email {
    const normalized = value.trim().toLocaleLowerCase();

    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);

    if (!isValid) {
      throw new InvalidEmailError();
    }

    return new Email(normalized);
  }

  public getValue(): string {
    return this.value;
  }
}
