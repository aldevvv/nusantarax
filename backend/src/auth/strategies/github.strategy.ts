import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-github2';
import { UsersService } from '../../users/users.service';
import { Provider } from '@prisma/client';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: `${configService.get('BACKEND_URL')}/api/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      const { id, username, displayName, emails, photos } = profile;
      
      const email = emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in GitHub profile'), null);
      }

      const fullName = displayName || username || 'GitHub User';

      const user = await this.usersService.findOrCreateOAuthUser({
        provider: Provider.GITHUB,
        providerId: id,
        email,
        fullName,
      });

      if (!user) {
        return done(new Error('Failed to create or find user'), null);
      }

      // Update last login
      await this.usersService.updateLastLogin(user.id);

      const authenticatedUser = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        emailVerified: user.emailVerified,
        lastLoginAt: new Date(),
      };

      done(null, authenticatedUser);
    } catch (error) {
      done(error, null);
    }
  }
}