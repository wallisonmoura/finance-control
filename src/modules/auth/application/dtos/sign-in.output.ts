export interface SignInOutput {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
