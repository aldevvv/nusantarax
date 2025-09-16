import { User, Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  emailVerified: boolean;
  lastLoginAt: Date | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthenticatedUser;
  };
}

export interface OAuthProfile {
  provider: 'github' | 'google';
  providerId: string;
  email: string;
  fullName: string;
  avatar?: string;
}

export interface TokenVerificationResult {
  token: string;
  expires: Date;
}