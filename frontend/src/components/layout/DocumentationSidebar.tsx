'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Code,
  Bot,
  Image as ImageIcon,
  MessageSquare,
  BarChart3,
  Wallet,
  ChevronDown,
  Play,
  X,
  Settings,
  Briefcase,
  CreditCard,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const DocumentationSidebar: React.FC<DocumentationSidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeSection, 
  setActiveSection 
}) => {
  const navigationSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Play className="h-4 w-4" />,
      subsections: [
        { id: 'introduction', title: 'Introduction' },
        { id: 'quickstart', title: 'Quickstart Guide' },
        { id: 'authentication', title: 'Authentication' }
      ]
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      icon: <Bot className="h-4 w-4" />,
      subsections: [
        { id: 'ai-overview', title: 'Overview' },
        { id: 'ai-integration', title: 'Integration' },
        { id: 'ai-customization', title: 'Customization' }
      ]
    },
    {
      id: 'image-generator',
      title: 'Image Generator',
      icon: <ImageIcon className="h-4 w-4" />,
      subsections: [
        { id: 'image-overview', title: 'Overview' },
        { id: 'image-templates', title: 'Template Generation' },
        { id: 'image-custom', title: 'Custom Generation' }
      ]
    },
    {
      id: 'caption-generator',
      title: 'Caption Generator',
      icon: <MessageSquare className="h-4 w-4" />,
      subsections: [
        { id: 'caption-overview', title: 'Overview' },
        { id: 'caption-styles', title: 'Tones & Languages' },
        { id: 'caption-optimization', title: 'Analysis & Scoring' }
      ]
    },
    {
      id: 'business-information',
      title: 'Business Information',
      icon: <Briefcase className="h-4 w-4" />,
      subsections: [
        { id: 'business-overview', title: 'Overview' },
        { id: 'basic-information', title: 'Basic Information' },
        { id: 'brand-identity', title: 'Brand Identity' },
        { id: 'ai-configuration', title: 'AI Configuration' }
      ]
    },
    {
      id: 'billing-usage',
      title: 'Billing & Usage',
      icon: <CreditCard className="h-4 w-4" />,
      subsections: [
        { id: 'billing-overview', title: 'Overview' },
        { id: 'usage-tracking', title: 'Usage Tracking' },
        { id: 'payment-history', title: 'Payment History' },
        { id: 'subscription-management', title: 'Subscription Management' }
      ]
    },
    {
      id: 'wallet-subscription',
      title: 'Wallet & Subscription Plan',
      icon: <Crown className="h-4 w-4" />,
      subsections: [
        { id: 'wallet-overview', title: 'Wallet Overview' },
        { id: 'wallet-transactions', title: 'Wallet Transactions' },
        { id: 'subscription-plans', title: 'Subscription Plans' },
        { id: 'plan-management', title: 'Plan Management' }
      ]
    },
    {
      id: 'analytics',
      title: 'Business Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      subsections: [
        { id: 'analytics-overview', title: 'Overview' },
        { id: 'analytics-dashboard', title: 'Dashboard' },
        { id: 'analytics-reports', title: 'Reports' }
      ]
    },
    {
      id: 'account-settings',
      title: 'Account Settings',
      icon: <Settings className="h-4 w-4" />,
      subsections: [
        { id: 'account-overview', title: 'Overview' },
        { id: 'profile-management', title: 'Profile Management' },
        { id: 'password-security', title: 'Password & Security' },
        { id: 'oauth-providers', title: 'OAuth Providers' }
      ]
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: <Code className="h-4 w-4" />,
      subsections: [
        { id: 'api-auth', title: 'Authentication' },
        { id: 'api-endpoints', title: 'Endpoints' },
        { id: 'api-examples', title: 'Examples' }
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-black border-r border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile Close Button */}
          <div className="lg:hidden flex justify-end p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <style jsx global>{`
              .documentation-sidebar-nav {
                scrollbar-width: thin;
                scrollbar-color: #72c306 #1f2937;
              }

              .documentation-sidebar-nav::-webkit-scrollbar {
                width: 8px;
              }

              .documentation-sidebar-nav::-webkit-scrollbar-track {
                background: #1f2937;
                border-radius: 4px;
              }

              .documentation-sidebar-nav::-webkit-scrollbar-thumb {
                background: #72c306;
                border-radius: 4px;
              }

              .documentation-sidebar-nav::-webkit-scrollbar-thumb:hover {
                background: #8fd428;
              }

              /* Hide scrollbar on mobile devices */
              @media (max-width: 1024px) {
                .documentation-sidebar-nav {
                  scrollbar-width: none;
                }
                
                .documentation-sidebar-nav::-webkit-scrollbar {
                  display: none;
                }
              }
            `}</style>
            <nav className="space-y-2 documentation-sidebar-nav" style={{ height: '100%', overflowY: 'auto' }}>
            {navigationSections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => setActiveSection(activeSection === section.id ? '' : section.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg transition-all duration-300 text-left",
                    activeSection === section.id
                      ? 'bg-[#72c306]/20 text-[#72c306] border border-[#72c306]/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {section.icon}
                    <span className="text-sm font-medium">{section.title}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${
                    activeSection === section.id ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {activeSection === section.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-6 mt-2 space-y-1"
                  >
                    {section.subsections.map((subsection) => (
                      <a
                        key={subsection.id}
                        href={`#${subsection.id}`}
                        className="block py-2 px-3 text-sm text-gray-400 hover:text-[#72c306] transition-colors rounded-lg"
                      >
                        {subsection.title}
                      </a>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DocumentationSidebar;