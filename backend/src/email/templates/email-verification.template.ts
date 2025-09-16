export const getEmailVerificationTemplate = (fullName: string, verificationUrl: string) => {
  return {
    subject: 'Verify your NusantaraX account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">NusantaraX</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${fullName}!</h2>
            
            <p style="margin-bottom: 20px;">Thank you for signing up with NusantaraX. To complete your registration and secure your account, please verify your email address.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block;
                        font-weight: bold;
                        font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="margin: 20px 0; font-size: 14px; color: #666;">
              Or copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; margin: 0;">
              This verification link will expire in 24 hours. If you didn't create an account with NusantaraX, please ignore this email.
            </p>
            
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              Best regards,<br>
              The NusantaraX Team
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to NusantaraX, ${fullName}!
      
      Thank you for signing up. Please verify your email address by clicking the link below:
      
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with NusantaraX, please ignore this email.
      
      Best regards,
      The NusantaraX Team
    `
  };
};