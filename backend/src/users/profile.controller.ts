import { 
  Controller, 
  Get, 
  Put, 
  Post, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/auth.types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { DisconnectOAuthDto } from './dto/disconnect-oauth.dto';
import { Provider } from '@prisma/client';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    try {
      const userWithProviders = await this.usersService.getUserWithProviders(user.id);
      
      // Format providers for frontend
      const providers = userWithProviders.providers.map(provider => ({
        provider: provider.provider,
        providerId: provider.providerId,
        connectedAt: provider.createdAt,
      }));

      // Check if user has manual password
      const hasManualPassword = !!userWithProviders.password;

      return {
        success: true,
        data: {
          profile: {
            id: userWithProviders.id,
            email: userWithProviders.email,
            fullName: userWithProviders.fullName,
            role: userWithProviders.role,
            emailVerified: userWithProviders.emailVerified,
            lastLoginAt: userWithProviders.lastLoginAt,
            createdAt: userWithProviders.createdAt,
            hasManualPassword,
          },
          providers,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch profile',
      };
    }
  }

  @Put()
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    try {
      const updatedUser = await this.usersService.updateProfile(
        user.id,
        updateProfileDto,
      );

      return {
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            role: updatedUser.role,
            emailVerified: updatedUser.emailVerified,
            lastLoginAt: updatedUser.lastLoginAt,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update profile',
      };
    }
  }

  @Post('password/change')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      await this.usersService.changePassword(
        user.id,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to change password',
      };
    }
  }

  @Post('password/set')
  @HttpCode(HttpStatus.OK)
  async setPassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() setPasswordDto: SetPasswordDto,
  ) {
    try {
      await this.usersService.setPassword(user.id, setPasswordDto.password);

      return {
        success: true,
        message: 'Password set successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to set password',
      };
    }
  }

  @Get('oauth/can-disconnect/:provider')
  async canDisconnectProvider(
    @CurrentUser() user: AuthenticatedUser,
    @Param('provider') provider: string,
  ) {
    try {
      // Validate provider
      const providerEnum = provider.toUpperCase() as Provider;
      
      if (providerEnum !== Provider.GITHUB && providerEnum !== Provider.GOOGLE) {
        return {
          success: false,
          message: 'Invalid provider specified',
        };
      }

      const canDisconnect = await this.usersService.canDisconnectProvider(
        user.id,
        providerEnum,
      );

      return {
        success: true,
        data: {
          canDisconnect,
          message: canDisconnect
            ? 'Provider can be safely disconnected'
            : 'Cannot disconnect this provider. You must have a manual password or another connected provider.',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to check disconnect capability',
      };
    }
  }

  @Delete('oauth/:provider')
  async disconnectOAuthProvider(
    @CurrentUser() user: AuthenticatedUser,
    @Param('provider') provider: string,
  ) {
    try {
      // Validate provider
      const providerEnum = provider.toUpperCase() as Provider;
      
      if (providerEnum !== Provider.GITHUB && providerEnum !== Provider.GOOGLE) {
        return {
          success: false,
          message: 'Invalid provider specified',
        };
      }

      const updatedUser = await this.usersService.disconnectOAuthProvider(
        user.id,
        providerEnum,
      );

      const providers = updatedUser.providers.map(p => ({
        provider: p.provider,
        providerId: p.providerId,
        connectedAt: p.createdAt,
      }));

      return {
        success: true,
        message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} account disconnected successfully`,
        data: {
          providers,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to disconnect OAuth provider',
      };
    }
  }

  @Get('security-info')
  async getSecurityInfo(@CurrentUser() user: AuthenticatedUser) {
    try {
      const userWithProviders = await this.usersService.getUserWithProviders(user.id);
      
      const hasManualPassword = !!userWithProviders.password;
      const oauthProviders = userWithProviders.providers.filter(
        p => p.provider !== Provider.LOCAL,
      );

      return {
        success: true,
        data: {
          hasManualPassword,
          connectedOAuthProviders: oauthProviders.length,
          canSetPassword: !hasManualPassword,
          canChangePassword: hasManualPassword,
          lastPasswordChange: null, // Could track this in future
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch security information',
      };
    }
  }
}