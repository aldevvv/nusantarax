import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload, AuthenticatedUser, AuthResponse } from './types/auth.types';
import { Provider } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, fullName } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user
    const user = await this.usersService.create({
      email,
      password,
      fullName,
      provider: Provider.LOCAL,
    });

    // Generate email verification token
    const verificationToken = await this.usersService.setEmailVerificationToken(
      user.id,
      this.configService.get('EMAIL_VERIFICATION_EXPIRY', '24h'),
    );

    // Send verification email
    try {
      await this.emailService.sendEmailVerification(email, fullName, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error here, user is created successfully
    }

    return {
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt,
        },
      },
    };
  }

  async login(loginDto: LoginDto, response: Response): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Validate user credentials using local strategy
    const user = await this.validateUser(email, password);

    // Generate JWT tokens
    const tokens = await this.generateTokens(user);

    // Set HTTP-only cookies
    this.setAuthCookies(response, tokens);

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          ...user,
          lastLoginAt: new Date(),
        },
      },
    };
  }

  async logout(response: Response): Promise<AuthResponse> {
    // Clear auth cookies
    this.clearAuthCookies(response);

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<AuthResponse> {
    const { email } = forgotPasswordDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      };
    }

    // Generate password reset token
    const resetToken = await this.usersService.setPasswordResetToken(
      user.id,
      this.configService.get('PASSWORD_RESET_EXPIRY', '1h'),
    );

    // Send password reset email
    try {
      await this.emailService.sendPasswordReset(email, user.fullName, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new BadRequestException('Failed to send password reset email');
    }

    return {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<AuthResponse> {
    const { token, password } = resetPasswordDto;

    try {
      await this.usersService.resetPassword(token, password);

      return {
        success: true,
        message: 'Password reset successful. Please login with your new password.',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      await this.usersService.verifyEmail(token);

      return {
        success: true,
        message: 'Email verified successfully. You can now login.',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async resendVerification(user: AuthenticatedUser): Promise<AuthResponse> {
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = await this.usersService.setEmailVerificationToken(
      user.id,
      this.configService.get('EMAIL_VERIFICATION_EXPIRY', '24h'),
    );

    // Send verification email
    try {
      await this.emailService.sendEmailVerification(user.email, user.fullName, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }

    return {
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    };
  }

  async resendVerificationByEmail(email: string): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message: 'If an account with this email exists, a verification email has been sent.',
      };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = await this.usersService.setEmailVerificationToken(
      user.id,
      this.configService.get('EMAIL_VERIFICATION_EXPIRY', '24h'),
    );

    // Send verification email
    try {
      await this.emailService.sendEmailVerification(user.email, user.fullName, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }

    return {
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    };
  }

  async validateUser(email: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      throw new UnauthorizedException('Please sign in with your social account');
    }

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(
      user.password,
      password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email address before signing in');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
    };
  }

  async generateTokens(user: AuthenticatedUser) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRY', '1h'),
      }),
    ]);

    return {
      accessToken,
    };
  }

  setAuthCookies(response: Response, tokens: { accessToken: string }) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: isProduction ? '.nusantarax.web.id' : undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    } as const;

    response.cookie('access_token', tokens.accessToken, cookieOptions);
  }

  clearAuthCookies(response: Response) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: isProduction ? '.nusantarax.web.id' : undefined,
      path: '/',
    } as const;

    response.clearCookie('access_token', cookieOptions);
  }

  async handleOAuthLogin(user: AuthenticatedUser, response: Response): Promise<void> {
    // Generate JWT tokens
    const tokens = await this.generateTokens(user);

    // Set HTTP-only cookies
    this.setAuthCookies(response, tokens);

    // Update last login
    await this.usersService.updateLastLogin(user.id);
  }

  getAuthRedirectUrl(success: boolean, error?: string): string {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    
    if (success) {
      return `${frontendUrl}/dashboard?auth=success`;
    } else {
      const encodedError = encodeURIComponent(error || 'Authentication failed');
      return `${frontendUrl}/login?error=${encodedError}`;
    }
  }
}