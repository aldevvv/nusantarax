import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Res, 
  Req, 
  UseGuards, 
  Query,
  HttpStatus
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import type { AuthenticatedUser } from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request & { user: AuthenticatedUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('resend-verification')
  async resendVerification(@Body('email') email?: string, @CurrentUser() user?: AuthenticatedUser) {
    // If user is authenticated, use their info
    if (user) {
      return this.authService.resendVerification(user);
    }
    
    // If email is provided, allow resend without authentication
    if (email) {
      return this.authService.resendVerificationByEmail(email);
    }
    
    throw new Error('Either email parameter or authentication is required');
  }

  @Get('me')
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return {
      success: true,
      data: {
        user,
      },
    };
  }

  @Get('session')
  async getSession(@Req() req: Request) {
    // Extract JWT token from cookies
    const token = req.cookies?.access_token;
    if (!token) {
      return {
        success: false,
        message: 'No session found',
      };
    }

    try {
      // Decode JWT to get expiration
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const remainingTime = Math.max(0, Math.floor((expirationTime - currentTime) / 1000)); // In seconds

      return {
        success: true,
        data: {
          expiresAt: expirationTime,
          remainingSeconds: remainingTime,
          isExpired: remainingTime <= 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid session',
      };
    }
  }

  @Get('refresh')
  async refresh(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.generateTokens(user);
    this.authService.setAuthCookies(res, tokens);

    return {
      success: true,
      message: 'Token refreshed successfully',
    };
  }

  // OAuth Routes
  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // This route initiates GitHub OAuth
  }

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(
    @Req() req: Request & { user: AuthenticatedUser },
    @Res() res: Response,
  ) {
    try {
      await this.authService.handleOAuthLogin(req.user, res);
      const redirectUrl = this.authService.getAuthRedirectUrl(true);
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      const redirectUrl = this.authService.getAuthRedirectUrl(false, 'GitHub authentication failed');
      return res.redirect(redirectUrl);
    }
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route initiates Google OAuth
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request & { user: AuthenticatedUser },
    @Res() res: Response,
  ) {
    try {
      await this.authService.handleOAuthLogin(req.user, res);
      const redirectUrl = this.authService.getAuthRedirectUrl(true);
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth error:', error);
      const redirectUrl = this.authService.getAuthRedirectUrl(false, 'Google authentication failed');
      return res.redirect(redirectUrl);
    }
  }

  // Health check endpoint
  @Public()
  @Get('health')
  async healthCheck() {
    return {
      success: true,
      message: 'Auth service is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}