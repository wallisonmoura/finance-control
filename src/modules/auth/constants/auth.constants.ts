export const AUTH_COOKIE_NAME = 'fc_access_token';

export const AUTH_TOKEN_SECRET = process.env.JWT_SECRET!;

export const AUTH_JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export const AUTH_UNAUTHORIZED_MESSAGE = 'Não autenticado';

export const AUTH_USER_NOT_FOUND_MESSAGE = 'Usuário autenticado não encontrado';

export const AUTH_PUBLIC_API_PATHS = [
  '/api/auth/sign-in',
  '/api/auth/register',
  '/api/auth/password-reset',
];

export const AUTH_PUBLIC_PAGE_PATHS = [
  '/login',
  '/register',
  '/about',
  '/forgot-password',
  '/reset-password',
];

export const AUTH_RATE_LIMIT_MAX_ATTEMPTS = 5;

export const AUTH_RATE_LIMIT_WINDOW_MINUTES = 15;

export const AUTH_TOO_MANY_LOGIN_ATTEMPTS_MESSAGE =
  'Muitas tentativas de login. Tente novamente em alguns minutos.';

export const AUTH_TOO_MANY_REGISTER_ATTEMPTS_MESSAGE =
  'Muitas tentativas de cadastro. Tente novamente em alguns minutos.';

export const AUTH_CSRF_ORIGIN_MISMATCH_MESSAGE =
  'Origem da requisição não permitida.';

// Password reset ("esqueci minha senha").
export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 60;

// Per account, silently: above it nothing is sent, but the answer is the same.
// Also keeps the Gmail sender under its daily limit.
export const PASSWORD_RESET_MAX_PER_ACCOUNT_PER_HOUR = 3;

// Always the same answer, whether the account exists or not.
export const PASSWORD_RESET_REQUEST_MESSAGE =
  'Se esse e-mail estiver cadastrado, enviamos um link pra criar uma nova senha. Confira também a caixa de spam.';

export const AUTH_TOO_MANY_PASSWORD_RESET_ATTEMPTS_MESSAGE =
  'Muitas tentativas. Tente novamente em alguns minutos.';
