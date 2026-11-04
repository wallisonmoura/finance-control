import {
  AUTH_JWT_EXPIRES_IN,
  AUTH_TOKEN_SECRET,
} from '../../constants/auth.constants';
import { JoseJwtTokenAdapter } from '../services/jose-jwt-token.adapter';

export function makeTokenService() {
  return new JoseJwtTokenAdapter(AUTH_TOKEN_SECRET, AUTH_JWT_EXPIRES_IN);
}
