import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from '../../users/users.service';
import { Provider } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${configService.get('BACKEND_URL')}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      const { id, name, emails, photos } = profile;
      
      const email = emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }

      const fullName = `${name?.givenName || ''} ${name?.familyName || ''}`.trim() || 'Google User';

      const user = await this.usersService.findOrCreateOAuthUser({
        provider: Provider.GOOGLE,
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