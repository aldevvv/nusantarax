import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role, Provider } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    email: string;
    password?: string;
    fullName: string;
    provider: Provider;
    providerId?: string;
    role?: Role;
  }) {
    const hashedPassword = data.password ? await argon2.hash(data.password) : null;
    
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role || Role.USER,
        emailVerified: data.provider !== Provider.LOCAL, // OAuth users are auto-verified
        providers: {
          create: {
            provider: data.provider,
            providerId: data.providerId,
          },
        },
      },
      include: {
        providers: true,
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        providers: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        providers: true,
      },
    });
  }

  async findByEmailVerificationToken(token: string) {
    return this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
      include: {
        providers: true,
      },
    });
  }

  async findByPasswordResetToken(token: string) {
    return this.prisma.user.findUnique({
      where: { passwordResetToken: token },
      include: {
        providers: true,
      },
    });
  }

  async setEmailVerificationToken(userId: string, expiresIn: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    
    // Parse expiry time (e.g., "24h", "1d", "30m")
    const timeUnit = expiresIn.slice(-1);
    const timeValue = parseInt(expiresIn.slice(0, -1));
    
    switch (timeUnit) {
      case 'h':
        expiresAt.setHours(expiresAt.getHours() + timeValue);
        break;
      case 'd':
        expiresAt.setDate(expiresAt.getDate() + timeValue);
        break;
      case 'm':
        expiresAt.setMinutes(expiresAt.getMinutes() + timeValue);
        break;
      default:
        expiresAt.setHours(expiresAt.getHours() + 24); // Default 24 hours
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt,
      },
    });

    return token;
  }

  async setPasswordResetToken(userId: string, expiresIn: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    
    // Parse expiry time
    const timeUnit = expiresIn.slice(-1);
    const timeValue = parseInt(expiresIn.slice(0, -1));
    
    switch (timeUnit) {
      case 'h':
        expiresAt.setHours(expiresAt.getHours() + timeValue);
        break;
      case 'd':
        expiresAt.setDate(expiresAt.getDate() + timeValue);
        break;
      case 'm':
        expiresAt.setMinutes(expiresAt.getMinutes() + timeValue);
        break;
      default:
        expiresAt.setHours(expiresAt.getHours() + 1); // Default 1 hour
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expiresAt,
      },
    });

    return token;
  }

  async verifyEmail(token: string) {
    const user = await this.findByEmailVerificationToken(token);
    
    if (!user || !user.emailVerificationExpires) {
      throw new Error('Invalid or expired verification token');
    }

    if (new Date() > user.emailVerificationExpires) {
      throw new Error('Verification token has expired');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
      include: {
        providers: true,
      },
    });
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.findByPasswordResetToken(token);
    
    if (!user || !user.passwordResetExpires) {
      throw new Error('Invalid or expired reset token');
    }

    if (new Date() > user.passwordResetExpires) {
      throw new Error('Reset token has expired');
    }

    const hashedPassword = await argon2.hash(newPassword);

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
      include: {
        providers: true,
      },
    });
  }

  async updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async validatePassword(hashedPassword: string, plainPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
      return false;
    }
  }

  async findOrCreateOAuthUser(profile: {
    provider: Provider;
    providerId: string;
    email: string;
    fullName: string;
  }) {
    // First check if user exists by provider ID
    const existingProvider = await this.prisma.userProvider.findFirst({
      where: {
        provider: profile.provider,
        providerId: profile.providerId,
      },
      include: {
        user: {
          include: {
            providers: true,
          },
        },
      },
    });

    if (existingProvider) {
      return existingProvider.user;
    }

    // Check if user exists by email
    const existingUser = await this.findByEmail(profile.email);
    
    if (existingUser) {
      // Add OAuth provider to existing user
      await this.prisma.userProvider.create({
        data: {
          userId: existingUser.id,
          provider: profile.provider,
          providerId: profile.providerId,
        },
      });

      return this.findById(existingUser.id);
    }

    // Create new user with OAuth provider
    return this.create({
      email: profile.email,
      fullName: profile.fullName,
      provider: profile.provider,
      providerId: profile.providerId,
    });
  }

  // Admin user management methods
  async findAll(page: number = 1, limit: number = 10, search?: string, roleFilter?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (roleFilter && roleFilter !== 'ALL') {
      where.role = roleFilter;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          providers: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUser(id: string, data: {
    fullName?: string;
    email?: string;
    role?: Role;
  }) {
    // Check if email is being changed and if it already exists
    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email already exists');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        providers: true,
      },
    });
  }

  async deleteUser(id: string) {
    // Check if user exists
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Don't allow deleting yourself (optional safety check)
    // This would need the current user ID passed in
    
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getUserStats() {
    const [total, verified, unverified, admins, users] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { emailVerified: true } }),
      this.prisma.user.count({ where: { emailVerified: false } }),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.user.count({ where: { role: Role.USER } }),
    ]);

    return {
      total,
      verified,
      unverified,
      admins,
      users,
    };
  }

  async createUserByAdmin(data: {
    email: string;
    fullName: string;
    password: string;
    role: Role;
  }) {
    // Check if user already exists
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user with admin privileges (email verified by default)
    return this.create({
      email: data.email,
      fullName: data.fullName,
      password: data.password,
      provider: Provider.LOCAL,
      role: data.role,
    });
  }
}