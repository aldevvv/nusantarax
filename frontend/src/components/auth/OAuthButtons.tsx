'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { authAPI } from '@/lib/api';
import { FaGithub, FaGoogle } from 'react-icons/fa';

interface OAuthButtonsProps {
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ 
  variant = 'outline', 
  size = 'default',
  className = ''
}) => {
  const handleOAuthLogin = (provider: 'github' | 'google') => {
    const authUrl = provider === 'github' 
      ? authAPI.getGitHubAuthUrl() 
      : authAPI.getGoogleAuthUrl();
    
    // Redirect to OAuth provider
    window.location.href = authUrl;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size={size}
        className="w-full bg-black border border-gray-800 text-gray-200 hover:bg-[#0f0f0f] hover:border-[#72c306] hover:text-[#72c306] transition-all"
        onClick={() => handleOAuthLogin('github')}
      >
        <FaGithub className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
      
      <Button
        type="button"
        variant="outline"
        size={size}
        className="w-full bg-black border border-gray-800 text-gray-200 hover:bg-[#0f0f0f] hover:border-[#72c306] hover:text-[#72c306] transition-all"
        onClick={() => handleOAuthLogin('google')}
      >
        <FaGoogle className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
};

export default OAuthButtons;
