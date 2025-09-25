export const getPasswordResetTemplate = (fullName: string, resetUrl: string) => {
  return {
    subject: 'Reset your NusantaraX password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password</title>
        </head>
        <body style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #ffffff; max-width: 600px; margin: 0 auto; padding: 0; background-color: #000000;">
          <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; border-bottom: 2px solid #72c306;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
              <tr>
                <td style="vertical-align: middle; padding-right: 10px;">
                  <img src="https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/NusantaraXX.png" alt="NusantaraX Logo" style="height: 40px; width: 40px; display: block;" />
                </td>
                <td style="vertical-align: middle;">
                  <h1 style="color: #72c306; margin: 0; font-size: 28px; font-weight: bold; line-height: 1;">NusantaraX</h1>
                  <p style="color: #8fd428; margin: 0; font-size: 12px; line-height: 1;">SMEs Digital Partner</p>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="background: #000000; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #72c306; border-top: none;">
            <h2 style="color: #72c306; margin-bottom: 20px; font-weight: bold;">Password Reset Request</h2>
            
            <p style="margin-bottom: 20px; color: #ffffff;">Hi ${fullName},</p>
            
            <p style="margin-bottom: 20px; color: #ffffff;">We received a request to reset the password for your NusantaraX account. If you made this request, please click the button below to set a new password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #72c306 0%, #8fd428 100%); 
                        color: #000000; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block;
                        font-weight: bold;
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(114, 195, 6, 0.3);
                        transition: all 0.3s ease;">
                Reset Password
              </a>
            </div>
            
            <p style="margin: 20px 0; font-size: 14px; color: #ffffff;">
              Or copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #72c306; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <div style="background: #1a1a1a; border: 1px solid #72c306; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #72c306;">
                <strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.
              </p>
            </div>
            
            <p style="margin: 20px 0; font-size: 14px; color: #cccccc;">
              If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <hr style="border: none; border-top: 1px solid #333333; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #888888; margin-top: 20px;">
              Best regards,<br>
              <span style="color: #72c306; font-weight: bold;">The NusantaraX Team</span>
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request - NusantaraX
      
      Hi ${fullName},
      
      We received a request to reset the password for your NusantaraX account.
      
      Please click the link below to set a new password:
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
      
      Best regards,
      The NusantaraX Team
    `
  };
};