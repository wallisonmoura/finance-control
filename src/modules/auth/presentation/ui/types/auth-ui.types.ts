export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
};

export type GetCurrentUserResponse = {
  user: AuthenticatedUser;
};

export type UpdateProfileInput = {
  name: string;
};

export type UpdateProfileResponse = {
  user: AuthenticatedUser;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type AuthApiResponse<T> = {
  data?: T;
  error?: string;
};

export type RequestPasswordResetInput = {
  email: string;
};

export type RequestPasswordResetResponse = {
  message: string;
};

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

// invalidLink: the link expired, was used, or is unknown (answered with 400).
export type ResetPasswordResponse = AuthApiResponse<null> & {
  invalidLink?: boolean;
};
