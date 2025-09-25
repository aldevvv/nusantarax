'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { profileAPI, authAPI, handleApiError } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  User,
  Shield,
  Key,
  Link,
  Unlink,
  Github,
  Chrome,
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  hasManualPassword: boolean;
  createdAt: string;
}

interface Provider {
  provider: 'GITHUB' | 'GOOGLE';
  providerId: string;
  connectedAt: string;
}

interface SecurityInfo {
  hasManualPassword: boolean;
  connectedOAuthProviders: number;
  canSetPassword: boolean;
  canChangePassword: boolean;
}

const ProfileSettingsPage = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Password forms
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [newPasswordForm, setNewPasswordForm] = useState({
    password: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const result = await profileAPI.getProfile();
      
      if (result.success) {
        setProfileData(result.data.profile);
        setProviders(result.data.providers || []);
        setFullName(result.data.profile.fullName);
      } else {
        toast.error(result.message || 'Failed to load profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error(handleApiError(error as any));
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityInfo = async () => {
    try {
      const result = await profileAPI.getSecurityInfo();
      
      if (result.success) {
        setSecurityInfo(result.data);
      }
    } catch (error) {
      console.error('Error loading security info:', error);
    }
  };

  useEffect(() => {
    if (profileData) {
      loadSecurityInfo();
    }
  }, [profileData]);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    try {
      setProfileLoading(true);
      const result = await profileAPI.updateProfile({ fullName: fullName.trim() });

      if (result.success) {
        toast.success('Profile updated successfully');
        await refreshUser();
        await loadProfileData();
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(handleApiError(error as any));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setPasswordLoading(true);
      const result = await profileAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      if (result.success) {
        toast.success('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        await loadSecurityInfo();
      } else {
        toast.error(result.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(handleApiError(error as any));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!newPasswordForm.password || !newPasswordForm.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPasswordForm.password !== newPasswordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPasswordForm.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setPasswordLoading(true);
      const result = await profileAPI.setPassword({
        password: newPasswordForm.password,
        confirmPassword: newPasswordForm.confirmPassword,
      });

      if (result.success) {
        toast.success('Password set successfully');
        setNewPasswordForm({ password: '', confirmPassword: '' });
        await loadProfileData();
        await loadSecurityInfo();
      } else {
        toast.error(result.message || 'Failed to set password');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      toast.error(handleApiError(error as any));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDisconnectProvider = async (provider: string) => {
    try {
      const result = await profileAPI.disconnectOAuth(provider.toLowerCase() as 'github' | 'google');

      if (result.success) {
        toast.success(result.message);
        await loadProfileData();
        await loadSecurityInfo();
      } else {
        toast.error(result.message || 'Failed to disconnect provider');
      }
    } catch (error) {
      console.error('Error disconnecting provider:', error);
      toast.error(handleApiError(error as any));
    }
  };

  const handleConnectProvider = (provider: 'github' | 'google') => {
    let authUrl: string;
    if (provider === 'github') {
      authUrl = authAPI.getGitHubAuthUrl();
    } else {
      authUrl = authAPI.getGoogleAuthUrl();
    }
    
    // Redirect to OAuth provider
    window.location.href = authUrl;
  };

  const isProviderConnected = (providerName: 'github' | 'google') => {
    return providers.some(p => p.provider.toLowerCase() === providerName.toLowerCase());
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toUpperCase()) {
      case 'GITHUB':
        return <Github className="h-5 w-5 text-white" />;
      case 'GOOGLE':
        return <Chrome className="h-5 w-5 text-white" />;
      default:
        return <Link className="h-5 w-5 text-white" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'GITHUB':
        return 'bg-gray-800 text-white border-gray-600';
      case 'GOOGLE':
        return 'bg-blue-600 text-white border-blue-500';
      default:
        return 'bg-gray-600 text-white border-gray-500';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#72c306]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">Failed to load profile</h2>
            <p className="text-gray-400 mt-2">Please try refreshing the page</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                <span className="hidden sm:inline">Profile Settings</span>
                <span className="sm:hidden">Profile Settings</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-400 mt-1 leading-relaxed">
                <span className="hidden sm:inline">Manage your account settings, security preferences, and connected accounts</span>
                <span className="sm:hidden">Manage your account settings</span>
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 gap-2">
            <TabsTrigger
              value="profile"
              className="flex items-center justify-center space-x-1 sm:space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] data-[state=active]:border-[#72c306] rounded-lg px-3 py-3 border border-transparent hover:border-[#72c306]/30 transition-colors"
            >
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Profile Info</span>
              <span className="sm:hidden text-xs">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center justify-center space-x-1 sm:space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] data-[state=active]:border-[#72c306] rounded-lg px-3 py-3 border border-transparent hover:border-[#72c306]/30 transition-colors"
            >
              <Shield className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Security</span>
              <span className="sm:hidden text-xs">Security</span>
            </TabsTrigger>
            <TabsTrigger
              value="accounts"
              className="flex items-center justify-center space-x-1 sm:space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] data-[state=active]:border-[#72c306] rounded-lg px-3 py-3 border border-transparent hover:border-[#72c306]/30 transition-colors"
            >
              <Link className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Connected Accounts</span>
              <span className="sm:hidden text-xs">Accounts</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Info Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Update your personal details and account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Avatar */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white text-2xl font-bold">
                      {profileData.fullName.charAt(0).toUpperCase()}
                    </div>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{profileData.fullName}</h3>
                    <p className="text-gray-400">{profileData.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={profileData.role === 'ADMIN' ? 'default' : 'secondary'} className="bg-[#72c306]/20 text-[#72c306] border-[#72c306]/30">
                        {profileData.role}
                      </Badge>
                      {profileData.emailVerified ? (
                        <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-black border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306] focus:ring-[#72c306]/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      disabled
                      className="bg-black border-[#72c306]/30 text-gray-400"
                    />
                    <p className="text-sm text-gray-400">
                      Email address cannot be changed
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={profileLoading || fullName === profileData.fullName}
                    className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                  >
                    {profileLoading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your password and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Security Status */}
                <div className="bg-[#72c306]/10 border border-[#72c306]/20 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">Security Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      {profileData.hasManualPassword ? (
                        <Lock className="h-4 w-4 text-green-400" />
                      ) : (
                        <Unlock className="h-4 w-4 text-orange-400" />
                      )}
                      <span className="text-sm text-gray-300">
                        {profileData.hasManualPassword ? 'Password Configured' : 'No Password Set'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-300">
                        {providers.length} OAuth Provider{providers.length !== 1 ? 's' : ''} Connected
                      </span>
                    </div>
                  </div>
                </div>

                {/* Password Management */}
                {profileData.hasManualPassword ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Change Password</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Enter your current password"
                          className="bg-black border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306] focus:ring-[#72c306]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter your new password"
                          className="bg-black border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306] focus:ring-[#72c306]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm your new password"
                          className="bg-black border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306] focus:ring-[#72c306]/20"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                      className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                    >
                      {passwordLoading ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Set Password</h4>
                    <p className="text-sm text-gray-400">
                      You signed up using a social account. Set a password to enable direct login.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-300">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newPasswordForm.password}
                          onChange={(e) => setNewPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter your password"
                          className="bg-black border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306] focus:ring-[#72c306]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPasswordSet" className="text-gray-300">Confirm Password</Label>
                        <Input
                          id="confirmPasswordSet"
                          type="password"
                          value={newPasswordForm.confirmPassword}
                          onChange={(e) => setNewPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm your password"
                          className="bg-black border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306] focus:ring-[#72c306]/20"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSetPassword}
                      disabled={passwordLoading}
                      className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                    >
                      {passwordLoading ? 'Setting Password...' : 'Set Password'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connected Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Link className="h-5 w-5" />
                  <span>Connected Accounts</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your connected social media accounts for easy sign-in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Connected Providers */}
                {providers.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Connected Accounts</h4>
                    {providers.map((provider) => (
                      <div key={provider.provider} className="flex items-center justify-between p-4 bg-black border border-[#72c306]/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getProviderIcon(provider.provider)}
                          <div>
                            <h4 className="font-medium text-white">
                              {provider.provider.charAt(0) + provider.provider.slice(1).toLowerCase()}
                            </h4>
                            <p className="text-sm text-gray-400">
                              Connected on {new Date(provider.connectedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnectProvider(provider.provider)}
                          className="text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-400/50 bg-red-500/10 hover:bg-red-500/20"
                        >
                          <Unlink className="h-4 w-4 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Available Providers to Connect */}
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Connect New Account</h4>
                  <div className="space-y-3">
                    {/* GitHub */}
                    {!isProviderConnected('github') && (
                      <div className="flex items-center justify-between p-4 bg-black border border-[#72c306]/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Github className="h-5 w-5 text-white" />
                          <div>
                            <h4 className="font-medium text-white">GitHub</h4>
                            <p className="text-sm text-gray-400">Connect your GitHub account</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleConnectProvider('github')}
                          size="sm"
                          className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                        >
                          <Link className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </div>
                    )}

                    {/* Google */}
                    {!isProviderConnected('google') && (
                      <div className="flex items-center justify-between p-4 bg-black border border-[#72c306]/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Chrome className="h-5 w-5 text-white" />
                          <div>
                            <h4 className="font-medium text-white">Google</h4>
                            <p className="text-sm text-gray-400">Connect your Google account</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleConnectProvider('google')}
                          size="sm"
                          className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                        >
                          <Link className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Show message if all providers are connected */}
                  {isProviderConnected('github') && isProviderConnected('google') && (
                    <div className="text-center py-4">
                      <CheckCircle className="h-12 w-12 text-[#72c306] mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-white mb-1">All Providers Connected</h3>
                      <p className="text-gray-400">
                        You have connected all available social accounts
                      </p>
                    </div>
                  )}
                </div>

                {/* Warning about disconnecting */}
                {providers.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-400">Important</h4>
                        <p className="text-sm text-yellow-300 mt-1">
                          You can only disconnect social accounts if you have a password set or another connected account.
                          This ensures you can always access your account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettingsPage;