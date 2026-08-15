import {
  AUTH_JWT_EXPIRES_IN,
  AUTH_TOKEN_SECRET,
} from '../../constants/auth.constants';
import { JoseJwtTokenService } from '../services/jose-jwt-token.adapter';

export function makeTokenService() {
  return new JoseJwtTokenService(AUTH_TOKEN_SECRET, AUTH_JWT_EXPIRES_IN);
}
