import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { getEmailVerificationTemplate } from './templates/email-verification.template';
import { getPasswordResetTemplate } from './templates/password-reset.template';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  async sendEmailVerification(
    email: string,
    fullName: string,
    verificationToken: string,
  ) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    const template = getEmailVerificationTemplate(fullName, verificationUrl);
    
    try {
      const result = await this.resend.emails.send({
        from: this.configService.get('EMAIL_FROM')!,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      return result;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordReset(
    email: string,
    fullName: string,
    resetToken: string,
  ) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    const template = getPasswordResetTemplate(fullName, resetUrl);
    
    try {
      const result = await this.resend.emails.send({
        from: this.configService.get('EMAIL_FROM')!,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      return result;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}