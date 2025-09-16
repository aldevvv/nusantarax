'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';

const DashboardPage = () => {
  const { user } = useAuth();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={fadeInUp} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent mb-2">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-gray-400">
            Manage your account and access your personalized dashboard.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            variants={fadeInUp}
            className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-[#72c306]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Account Information</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Full Name:</span>
                <span className="font-medium text-white">{user?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="font-medium text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'ADMIN'
                    ? 'bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 text-[#72c306] border border-[#72c306]/30'
                    : 'bg-gray-800 text-gray-300'
                }`}>
                  {user?.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email Status:</span>
                <span className={`flex items-center text-sm ${
                  user?.emailVerified ? 'text-[#72c306]' : 'text-orange-400'
                }`}>
                  {user?.emailVerified ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Unverified
                    </>
                  )}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-[#72c306]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Activity</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Last Login:</span>
                <span className="font-medium text-white">
                  {user?.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Account Created:</span>
                <span className="font-medium text-white">Recently</span>
              </div>
            </div>
          </motion.div>
        </div>

        {user?.role === 'ADMIN' && (
          <motion.div
            variants={fadeInUp}
            className="bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-lg p-6 text-white mb-8 shadow-lg shadow-[#72c306]/25"
          >
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 mr-3" />
              <h3 className="text-xl font-semibold">Admin Access</h3>
            </div>
            <p className="text-green-100 mb-4">
              You have administrator privileges. Access the user management panel through the sidebar.
            </p>
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/admin/users'}
              className="bg-white text-[#72c306] hover:bg-gray-100 shadow-md"
            >
              <Shield className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </motion.div>
        )}

        <motion.div
          variants={fadeInUp}
          className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start text-white border-gray-700 hover:bg-gray-800 hover:text-[#72c306]">
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button variant="outline" className="justify-start text-white border-gray-700 hover:bg-gray-800 hover:text-[#72c306]">
              <Shield className="mr-2 h-4 w-4" />
              Security Settings
            </Button>
            {!user?.emailVerified && (
              <Button variant="outline" className="justify-start text-orange-400 border-orange-600/50 hover:bg-orange-600/10">
                <Mail className="mr-2 h-4 w-4" />
                Verify Email
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default DashboardPage;