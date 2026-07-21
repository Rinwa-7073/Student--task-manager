import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import type { AuthUser } from '@features/auth/auth.types';

/**
 * Thin wrapper around `jsonwebtoken` so the rest of the app never touches
 * the library (or the secret) directly. Centralizing this also means the
 * token payload shape (`AuthUser`) is defined in exactly one place.
 */
export const signToken = (payload: AuthUser): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

export const verifyToken = (token: string): AuthUser => {
  return jwt.verify(token, env.JWT_SECRET) as AuthUser;
};