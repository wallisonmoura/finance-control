import { requestPasswordResetSchema } from '@/modules/auth/presentation/http/schemas/request-password-reset.schema';
import { resetPasswordSchema } from '@/modules/auth/presentation/http/schemas/reset-password.schema';
import { changePasswordSchema } from '@/modules/auth/presentation/http/schemas/change-password.schema';
import { signInSchema } from '@/modules/auth/presentation/http/schemas/sign-in.schema';
import { signUpSchema } from '@/modules/auth/presentation/http/schemas/sign-up.schema';
import { updateProfileSchema } from '@/modules/auth/presentation/http/schemas/update-profile.schema';

describe('auth request bodies', () => {
  // Each valid body is exactly what the matching form sends.
  it.each([
    ['sign in', signInSchema, { email: 'a@b.com', password: 'secret' }],
    ['sign up', signUpSchema, { name: 'Ana', email: 'a@b.com', password: 'secret12' }],
    ['update profile', updateProfileSchema, { name: 'Ana' }],
    ['change password', changePasswordSchema, { currentPassword: 'old', newPassword: 'newsecret' }],
    ['request password reset', requestPasswordResetSchema, { email: 'a@b.com' }],
    ['reset password', resetPasswordSchema, { token: 'abc', newPassword: 'newsecret' }],
  ] as const)('should accept the %s body and refuse unknown fields', (_name, schema, body) => {
    expect(schema.safeParse(body).success).toBe(true);
    expect(schema.safeParse({ ...body, isAdmin: true }).success).toBe(false);
  });
});
