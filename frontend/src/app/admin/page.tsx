'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Settings, BarChart3, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';

const AdminPage = () => {
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

  const adminFeatures = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      action: "Manage Users",
      href: "/admin/users"
    },
    {
      icon: <Shield className="h-6 w-6 text-purple-600" />,
      title: "Security Settings",
      description: "Configure authentication and security policies",
      action: "Security Panel",
      href: "/admin/security"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-green-600" />,
      title: "Analytics",
      description: "View system usage and performance metrics",
      action: "View Analytics",
      href: "/admin/analytics"
    },
    {
      icon: <Settings className="h-6 w-6 text-orange-600" />,
      title: "System Settings",
      description: "Configure application settings and preferences",
      action: "System Config",
      href: "/admin/settings"
    }
  ];

  return (
    <DashboardLayout requiredRole="ADMIN">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mr-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome, {user?.fullName}. Manage your NusantaraX platform.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Admin Warning */}
        <motion.div 
          variants={fadeInUp}
          className="bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 rounded-lg p-4 mb-8"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
            <div>
              <h4 className="font-medium text-orange-800">Administrator Access</h4>
              <p className="text-sm text-orange-700">
                You have elevated privileges. Please use these tools responsibly.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Admin Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {adminFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  if (feature.href === '/admin/users') {
                    window.location.href = feature.href;
                  } else {
                    console.log(`${feature.action} clicked - Feature coming soon`);
                  }
                }}
              >
                {feature.action}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* System Overview */}
        <motion.div 
          variants={fadeInUp}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-xl font-semibold mb-6">System Overview</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">0</div>
              <div className="text-sm text-gray-600">Active Sessions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">1</div>
              <div className="text-sm text-gray-600">Admin Users</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          variants={fadeInUp}
          className="mt-8 bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="justify-start h-12"
              onClick={() => window.location.href = '/admin/users'}
            >
              <Users className="mr-2 h-4 w-4" />
              View All Users
            </Button>
            <Button variant="outline" className="justify-start h-12">
              <Shield className="mr-2 h-4 w-4" />
              Security Logs
            </Button>
            <Button variant="outline" className="justify-start h-12">
              <Settings className="mr-2 h-4 w-4" />
              App Settings
            </Button>
            <Button variant="outline" className="justify-start h-12">
              <BarChart3 className="mr-2 h-4 w-4" />
              Reports
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminPage;