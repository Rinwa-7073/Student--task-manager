import bcrypt from 'bcryptjs';
import { prisma } from '@config/prisma';
import { ApiError } from '@utils/ApiError';
import { signToken } from '@utils/jwt';
import { env } from '@config/env';
import type { LoginInput, RegisterInput } from '@features/auth/auth.validation';
import type { AuthResult, PublicUser } from '@features/auth/auth.types';

/** Strips the password hash before a User record ever leaves the service layer. */
function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, password: passwordHash },
    });

    const publicUser = toPublicUser(user);
    const token = signToken({ id: user.id, email: user.email });
    return { user: publicUser, token };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    // Same error for "no such user" and "wrong password" — revealing which
    // one it was would let an attacker enumerate registered emails.
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password);
    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const publicUser = toPublicUser(user);
    const token = signToken({ id: user.id, email: user.email });
    return { user: publicUser, token };
  }

  async getById(id: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw ApiError.notFound('User not found');
    return toPublicUser(user);
  }
}

export const authService = new AuthService();