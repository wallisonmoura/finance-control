import { User } from '@/modules/auth/domain/entities/user.entity';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';

describe('User Entity', () => {
  it('should create a user correctly', () => {
    const createdAt = new Date('2026-03-19T10:00:00.000Z');
    const updatedAt = new Date('2026-03-19T10:30:00.000Z');

    const user = new User({
      id: 'user-1',
      name: 'Wallison',
      email: Email.create('wallison@email.com'),
      passwordHash: 'hashed-password',
      createdAt,
      updatedAt,
    });

    expect(user.id).toBe('user-1');
    expect(user.name).toBe('Wallison');
    expect(user.email.getValue()).toBe('wallison@email.com');
    expect(user.passwordHash).toBe('hashed-password');
    expect(user.createdAt).toEqual(createdAt);
    expect(user.updatedAt).toEqual(updatedAt);
  });

  it('should keep email as value object', () => {
    const user = new User({
      id: 'user-2',
      name: 'User Test',
      email: Email.create('user@test.com'),
      passwordHash: '123456',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(user.email).toBeInstanceOf(Email);
    expect(user.email.getValue()).toBe('user@test.com');
  });
});
