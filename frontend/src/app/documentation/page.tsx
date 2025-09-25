'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Code,
  Bot,
  Image as ImageIcon,
  MessageSquare,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  Copy,
  Terminal,
  Settings,
  Database,
  Globe,
  ArrowRight,
  ExternalLink,
  Play,
  Menu,
  Key,
  Target,
  PieChart,
  LineChart,
  FileBarChart,
  Layers,
  Brush,
  Type,
  TrendingUp,
  Users,
  Star,
  Hash,
  Smile,
  User,
  Github,
  Chrome,
  Lock,
  Mail,
  Briefcase,
  Building2,
  Palette,
  CreditCard,
  Crown,
  Clock,
  XCircle,
  Wallet,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvancedNavbar from '@/components/layout/AdvancedNavbar';
import DocumentationSidebar from '@/components/layout/DocumentationSidebar';
import FloatingMascot from '@/components/ui/FloatingMascot';

const DocumentationPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AdvancedNavbar />
      
      <div className="flex h-screen bg-black pt-20">
        <DocumentationSidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <main className="flex-1 overflow-y-auto bg-black">
            <div className="p-4 sm:p-6 md:p-8 w-full">
              <div className="mb-8 sm:mb-12">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">NusantaraX API Documentation</h1>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                  Welcome to the NusantaraX API documentation. This guide will help you get started with integrating
                  NusantaraX AI capabilities into your applications.
                </p>
              </div>

              {/* GETTING STARTED SECTIONS */}
              
              {/* Introduction */}
              <div id="introduction" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Play className="h-6 w-6 text-[#72c306] mr-3" />
                  Introduction
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  NusantaraX is Indonesia&apos;s leading SaaS platform for SMEs, providing AI-powered tools to automate 
                  digital marketing and enhance business efficiency.
                </p>
                
                <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span className="text-yellow-500 font-semibold">Coming Soon!</span>
                  </div>
                  <p className="text-gray-300 mb-4">
                    The official <code className="text-[#72c306]">@nusantarax/client</code> SDK library is currently in development.
                  </p>
                  <div className="bg-gray-900/80 rounded-lg p-4">
                    <code className="text-gray-500">npm install @nusantarax/client  # Coming in next update</code>
                  </div>
                  <p className="text-yellow-400 text-sm mt-3">
                    ⚠️ This feature will be available in the upcoming release. For now, use direct API calls.
                  </p>
                </div>
              </div>

              {/* Quickstart Guide */}
              <div id="quickstart" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Zap className="h-6 w-6 text-[#72c306] mr-3" />
                  Quickstart Guide
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Get started with NusantaraX in just a few minutes.
                </p>

                <div className="space-y-6">
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#72c306] text-black font-bold mr-3">1</span>
                      Create Your Account
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Sign up for a free NusantaraX account to get started.
                    </p>
                    <Button asChild className="bg-gradient-to-r from-[#72c306] to-[#8fd428]">
                      <Link href="/register">Create Account</Link>
                    </Button>
                  </div>
                  
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#72c306] text-black font-bold mr-3">2</span>
                      Generate API Key
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Go to your dashboard settings to generate your API key.
                    </p>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-500 font-medium text-sm">Coming Soon</span>
                      </div>
                      <p className="text-yellow-400 text-sm">
                        API key generation feature is currently in development and will be available in the next update.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authentication */}
              <div id="authentication" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Key className="h-6 w-6 text-[#72c306] mr-3" />
                  Authentication
                </h2>
                <p className="text-lg text-gray-300 mb-6">
                  All API requests require authentication using an API key.
                </p>
                
                <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">API Key Usage</h3>
                  <div className="p-4 bg-gray-900/80 rounded-lg">
                    <code className="text-sm text-[#72c306]">Authorization: Bearer your-api-key-here</code>
                  </div>
                </div>
              </div>

              {/* AI ASSISTANT SECTIONS */}
              
              {/* AI Assistant Overview */}
              <div id="ai-overview" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Bot className="h-6 w-6 text-[#72c306] mr-3" />
                  AI Assistant Overview
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  NusantaraX AI Assistant is your specialized digital marketing expert powered by <strong>Gemini 2.5 Pro</strong>,
                  exclusively focused on providing expert digital marketing advice, strategies, and insights for businesses in Indonesia and globally.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Core Architecture</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />One Session Per User (persistent chat)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Context-Aware responses</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Image analysis (10MB, 24h cache)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Token tracking & analytics</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Marketing Expertise</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Social Media Marketing</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Content Marketing & SEO</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />E-commerce Optimization</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Indonesian Market Focus</li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">Specialized Marketing Areas</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-sm text-gray-300">
                      <div><strong className="text-[#72c306]">Social Media:</strong> Platform strategy, content calendar, advertising optimization</div>
                      <div><strong className="text-[#72c306]">Content Marketing:</strong> Strategy development, blog content, email campaigns</div>
                      <div><strong className="text-[#72c306]">SEO & SEM:</strong> Keyword research, Google Ads, local Indonesian SEO</div>
                      <div><strong className="text-[#72c306]">Analytics:</strong> KPI tracking, conversion optimization, ROI measurement</div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div><strong className="text-[#72c306]">Brand Development:</strong> Positioning, competitive analysis, messaging</div>
                      <div><strong className="text-[#72c306]">E-commerce:</strong> Marketplace optimization (Tokopedia, Shopee, Lazada)</div>
                      <div><strong className="text-[#72c306]">Indonesian Market:</strong> Local consumer behavior, cultural adaptation</div>
                      <div><strong className="text-[#72c306]">Automation:</strong> Customer journey mapping, retention programs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Integration */}
              <div id="ai-integration" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Code className="h-6 w-6 text-[#72c306] mr-3" />
                  Chat Interface & Features
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  The AI Assistant provides a comprehensive chat interface with three main tabs: Chat, Statistics, and Configuration.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Chat Tab</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Real-time messaging</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Image upload support</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Message history</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Token usage display</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Statistics Tab</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Total messages sent</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Input/output tokens</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Average tokens per message</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Last activity tracking</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Configuration Tab</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Global context setup</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Business information</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Context examples</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Save/reset options</li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">Available Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400">CHAT</span>
                        <span className="text-gray-300 text-sm">Send messages and get AI responses</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400">UPLOAD</span>
                        <span className="text-gray-300 text-sm">Upload images for analysis</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-orange-500/20 text-orange-400">CONFIG</span>
                        <span className="text-gray-300 text-sm">Configure business context</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-purple-500/20 text-purple-400">STATS</span>
                        <span className="text-gray-300 text-sm">View usage statistics</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Customization */}
              <div id="ai-customization" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Settings className="h-6 w-6 text-[#72c306] mr-3" />
                  Business Context Configuration
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Configure your business context through the Configuration tab to receive highly personalized marketing advice.
                  The system uses both Business Information and Global Context for optimal responses.
                </p>

                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/50">
                    <h3 className="text-xl font-bold text-white mb-4">Context Sources (Priority Order)</h3>
                    <ol className="space-y-2 text-gray-300 list-decimal list-inside">
                      <li><strong className="text-[#72c306]">Global Context:</strong> User-configured custom business context (highest priority)</li>
                      <li><strong className="text-[#72c306]">Business Information:</strong> Data from Business Information page (automatic fallback)</li>
                      <li><strong className="text-[#72c306]">Conversation History:</strong> Last 10 messages for context continuity</li>
                    </ol>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Configuration Examples</h3>
                      <div className="space-y-3 text-sm text-gray-300">
                        <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                          <strong className="text-[#72c306]">E-commerce Business:</strong><br/>
                          "I run online fashion store 'StyleIndo' targeting young Indonesian women aged 18-30.
                          Main challenges: increasing Instagram engagement, improving conversion rates. Goals: reach 10K followers, 5% conversion rate."
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                          <strong className="text-[#72c306]">Local F&B Business:</strong><br/>
                          "I run 'Pizza Corner' restaurant in Bandung targeting families. Challenges: competing with delivery apps, building brand awareness.
                          Goals: become #1 pizza place, launch delivery service."
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Image Analysis Features</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Upload marketing materials & product photos</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />10MB file limit (JPEG, PNG, WebP)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />24-hour automatic cache cleanup</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />AI analyzes branding & marketing potential</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Platform-specific optimization suggestions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* BUSINESS INFORMATION SECTIONS */}
              
              {/* Business Information Overview */}
              <div id="business-overview" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Briefcase className="h-6 w-6 text-[#72c306] mr-3" />
                  Business Information Overview
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Comprehensive business profile management system for AI-powered content generation and personalized marketing strategies.
                  Configure your business details across four main categories to enhance AI Assistant context and improve content relevance.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Core Features</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Tabbed interface (Basic, Brand, Contact, AI)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />18 business categories with subcategories</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Brand identity management (colors, voice, personality)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />AI-specific configuration for content generation</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Business Sizes</h3>
                    <div className="space-y-2 text-gray-300 text-sm">
                      <div><strong className="text-[#72c306]">MICRO:</strong> Small businesses with limited resources</div>
                      <div><strong className="text-[#72c306]">SMALL:</strong> Growing businesses with expanding operations</div>
                      <div><strong className="text-[#72c306]">MEDIUM:</strong> Established businesses with significant scale</div>
                      <div><strong className="text-[#72c306]">LARGE:</strong> Enterprise-level businesses with extensive operations</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">Available Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400">VIEW</span>
                        <span className="text-gray-300 text-sm">Access your business information</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400">CREATE</span>
                        <span className="text-gray-300 text-sm">Set up your business profile</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-orange-500/20 text-orange-400">UPDATE</span>
                        <span className="text-gray-300 text-sm">Modify your business details</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div id="basic-information" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Building2 className="h-6 w-6 text-[#72c306] mr-3" />
                  Basic Information
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Essential business details including name, description, category, industry classification, and business model configuration.
                </p>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Required Fields</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Business Name (string, required)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Business Category (18 predefined options)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Business Description (text area)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Business Size (MICRO/SMALL/MEDIUM/LARGE)</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Optional Fields</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Sub-Category (string)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Industry (18 predefined options)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Business Model (B2C/B2B/B2B2C/Marketplace)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Established Year (number)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-900/50 border border-[#72c306]/30 rounded-xl">
                    <h3 className="text-xl font-bold text-[#72c306] mb-4">Available Categories</h3>
                    <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-300">
                      {[
                        'Food & Beverage', 'Fashion & Apparel', 'Technology & Software', 'Health & Beauty',
                        'Education & Training', 'Retail & E-commerce', 'Services & Consulting', 'Manufacturing',
                        'Agriculture & Farming', 'Tourism & Hospitality', 'Arts & Crafts', 'Automotive',
                        'Construction & Real Estate', 'Finance & Insurance', 'Media & Entertainment', 'Sports & Recreation',
                        'Home & Garden', 'Other'
                      ].map((category, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded">
                          <span className="w-2 h-2 bg-[#72c306] rounded-full"></span>
                          <span>{category}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Identity */}
              <div id="brand-identity" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Palette className="h-6 w-6 text-[#72c306] mr-3" />
                  Brand Identity
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Define your brand colors, voice, personality traits, and visual identity. This information is used by AI services to maintain brand consistency across generated content.
                </p>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Brand Colors</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Up to 5 brand colors (hex codes)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Visual color picker interface</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Real-time preview and validation</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Modern storage format</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Logo Management</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Secure cloud storage integration</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />5MB file size limit</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Image format support (JPEG, PNG, WebP)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Automatic file naming</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-900/50 border border-[#72c306]/30 rounded-xl">
                      <h3 className="text-xl font-bold text-[#72c306] mb-4">Brand Voice Options</h3>
                      <div className="space-y-1 text-sm text-gray-300">
                        {['Professional', 'Casual', 'Friendly', 'Authoritative', 'Humorous', 'Educational', 'Inspirational', 'Trustworthy'].map((voice, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#72c306] rounded-full"></span>
                            <span>{voice}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 bg-gray-900/50 border border-[#72c306]/30 rounded-xl">
                      <h3 className="text-xl font-bold text-[#72c306] mb-4">Brand Personality Traits</h3>
                      <div className="space-y-1 text-sm text-gray-300">
                        {['Innovative', 'Trustworthy', 'Creative', 'Reliable', 'Modern', 'Traditional', 'Bold', 'Elegant', 'Fun', 'Sophisticated', 'Caring', 'Dynamic'].map((trait, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#72c306] rounded-full"></span>
                            <span>{trait}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Configuration */}
              <div id="ai-configuration" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Target className="h-6 w-6 text-[#72c306] mr-3" />
                  AI Configuration
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Configure AI-specific settings including target audience definition, content preferences, and marketing focus areas.
                  This data is used by AI Assistant for contextual responses and by content generators for personalized output.
                </p>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Target Audience & Goals</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Target Audience (text description)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Business Goals (array of strings)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Marketing Focus (array of strategies)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Main Products & Services (dynamic arrays)</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Content Preferences</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Content Tone (Professional/Casual/Humorous/Educational)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Preferred Language (Indonesian/English)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Content completion tracking</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Automatic timestamp management</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-900/50 border border-[#72c306]/30 rounded-xl">
                    <h3 className="text-xl font-bold text-[#72c306] mb-4">AI Integration Context</h3>
                    <div className="space-y-3 text-gray-300 text-sm">
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>AI Assistant Context:</strong> Business information is automatically included in AI Assistant responses when global context is not configured, providing personalized marketing advice based on your business profile.
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Image Generator Context:</strong> Business details are optionally included in image generation prompts to create brand-consistent visual content that aligns with your business identity.
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Caption Generator Context:</strong> Target audience and brand voice information helps generate platform-specific captions that resonate with your customers and maintain brand consistency.
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Data Validation</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Business name and category validation</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Predefined dropdown options</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Smart field validation</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Automatic completion tracking</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Contact & Location</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Address, City, Region, Postal Code</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Website URL and Phone Number</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Social Media Integration (JSON object)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />All contact fields are optional</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* IMAGE GENERATOR SECTIONS */}
              
              {/* Image Generator Overview */}
              <div id="image-overview" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <ImageIcon className="h-6 w-6 text-[#72c306] mr-3" />
                  Image Generator Overview
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Generate professional product images using our advanced AI pipeline powered by <strong>Gemini 2.5 Pro</strong> and <strong>Imagen 4.0</strong>. 
                  Create 1-12 high-quality images per generation with intelligent prompt enhancement and business context integration.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Generation Modes</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Template-based generation with predefined categories</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Custom prompt generation with AI enhancement</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Business context integration for relevance</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Batch generation (1-12 images simultaneously)</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Technical Specifications</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Powered by Google Imagen 4.0</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Gemini 2.5 Pro prompt enhancement</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Aspect ratios: 1:1, 3:4, 9:16, 16:9</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />High-resolution PNG output</li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">AI Processing Pipeline</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-[#72c306]/10 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#72c306] text-black font-bold mx-auto mb-2 flex items-center justify-center">1</div>
                      <h4 className="font-semibold text-white text-sm">Prompt Analysis</h4>
                      <p className="text-gray-300 text-xs">Gemini 2.5 Pro analyzes and enhances your prompt</p>
                    </div>
                    <div className="text-center p-4 bg-[#72c306]/10 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#72c306] text-black font-bold mx-auto mb-2 flex items-center justify-center">2</div>
                      <h4 className="font-semibold text-white text-sm">Prompt Creation</h4>
                      <p className="text-gray-300 text-xs">AI creates optimized final prompt for generation</p>
                    </div>
                    <div className="text-center p-4 bg-[#72c306]/10 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#72c306] text-black font-bold mx-auto mb-2 flex items-center justify-center">3</div>
                      <h4 className="font-semibold text-white text-sm">Image Generation</h4>
                      <p className="text-gray-300 text-xs">Imagen 4.0 generates 1-12 high-quality images</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Template Generation */}
              <div id="image-templates" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Layers className="h-6 w-6 text-[#72c306] mr-3" />
                  Template Generation
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Use pre-designed templates with customizable fields to generate professional product images.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Template Categories</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Food & Beverage products</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Fashion & Accessories</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Electronics & Technology</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Beauty & Health products</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Template Features</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Dynamic field replacement</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Style and background preferences</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Business context integration</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Configurable aspect ratios</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Image Custom Generation */}
              <div id="image-custom" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Brush className="h-6 w-6 text-[#72c306] mr-3" />
                  Custom Generation
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Create unique images from custom text prompts with AI-powered enhancement using 3-step processing pipeline.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Request Consumption</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><Star className="h-4 w-4 text-yellow-500 mr-2" />1 request: Prompt analysis (Gemini 2.5 Pro)</li>
                      <li className="flex items-center"><Star className="h-4 w-4 text-yellow-500 mr-2" />1 request: Prompt creation (Gemini 2.5 Pro)</li>
                      <li className="flex items-center"><Star className="h-4 w-4 text-yellow-500 mr-2" />N requests: Image generation (Imagen 4.0)</li>
                      <li className="flex items-center"><Star className="h-4 w-4 text-yellow-500 mr-2" />+1 request: Business context (optional)</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Output Formats</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />PNG (with transparency)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />High-resolution output</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Secure cloud storage integration</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Parallel upload processing</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CAPTION GENERATOR SECTIONS */}
              
              {/* Caption Generator Overview */}
              <div id="caption-overview" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <MessageSquare className="h-6 w-6 text-[#72c306] mr-3" />
                  Caption Generator Overview
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Generate engaging social media captions powered by <strong>Gemini 2.5 Pro</strong> with advanced image analysis and 
                  <strong>10-metric scoring system</strong>. Upload images and get 3 optimized caption variations.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl border border-green-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Supported Platforms</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Instagram (posts, stories, reels)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Facebook (posts, ads, storytelling)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />TikTok (short, punchy content)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Platform-specific optimization</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl border border-green-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Request Consumption</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-gray-300 text-sm">1 request: Image analysis + Caption generation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-gray-300 text-sm">1 request: 10-metric performance analysis</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-300 text-sm">Total: 2 requests per generation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caption Tones & Languages */}
              <div id="caption-styles" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Type className="h-6 w-6 text-[#72c306] mr-3" />
                  Tones & Languages
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Choose from 7 different writing tones and 2 languages. The AI uses completely different prompts based on language selection.
                </p>

                <div className="space-y-6">
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Available Tones</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        {[
                          { tone: 'PROFESSIONAL', description: 'Formal, authoritative tone for B2B content' },
                          { tone: 'CASUAL', description: 'Friendly, approachable tone for engagement' },
                          { tone: 'FUNNY', description: 'Humorous, entertaining tone for viral content' },
                          { tone: 'INSPIRING', description: 'Motivational, uplifting tone for inspiration' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-[#72c306] mt-2"></div>
                            <div>
                              <h4 className="font-semibold text-white text-sm">{item.tone}</h4>
                              <p className="text-gray-300 text-xs">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        {[
                          { tone: 'SALES', description: 'Persuasive, conversion-focused tone' },
                          { tone: 'EDUCATIONAL', description: 'Informative, helpful tone for tutorials' },
                          { tone: 'STORYTELLING', description: 'Narrative, story-driven content' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-[#72c306] mt-2"></div>
                            <div>
                              <h4 className="font-semibold text-white text-sm">{item.tone}</h4>
                              <p className="text-gray-300 text-xs">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl border border-green-500/20">
                      <h3 className="text-xl font-bold text-white mb-4">Language Support</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🇺🇸</span>
                          <div>
                            <h4 className="font-semibold text-white">English (EN)</h4>
                            <p className="text-gray-300 text-sm">Global audience optimization</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🇮🇩</span>
                          <div>
                            <h4 className="font-semibold text-white">Bahasa Indonesia (ID)</h4>
                            <p className="text-gray-300 text-sm">Local Indonesian market optimization</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl border border-green-500/20">
                      <h3 className="text-xl font-bold text-white mb-4">Caption Lengths</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">SHORT</span>
                          <span className="text-[#72c306] text-sm">50-100 characters</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">MEDIUM</span>
                          <span className="text-[#72c306] text-sm">150-250 characters</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">LONG</span>
                          <span className="text-[#72c306] text-sm">350+ characters</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caption Analysis & Scoring */}
              <div id="caption-optimization" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <TrendingUp className="h-6 w-6 text-[#72c306] mr-3" />
                  Analysis & Scoring
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Advanced 10-metric scoring system provides comprehensive performance predictions (7-10 range).
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Performance Metrics</h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-center"><Target className="h-4 w-4 text-[#72c306] mr-2" />Engagement Score: Overall engagement prediction</li>
                      <li className="flex items-center"><Target className="h-4 w-4 text-[#72c306] mr-2" />Readability Score: Clarity and ease of reading</li>
                      <li className="flex items-center"><Target className="h-4 w-4 text-[#72c306] mr-2" />CTA Strength: Call-to-action effectiveness</li>
                      <li className="flex items-center"><Target className="h-4 w-4 text-[#72c306] mr-2" />Brand Voice Score: Brand consistency</li>
                      <li className="flex items-center"><Target className="h-4 w-4 text-[#72c306] mr-2" />Trending Potential: Viral likelihood</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Content Controls</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Smile className="h-5 w-5 text-yellow-400" />
                        <div>
                          <h4 className="font-semibold text-white text-sm">Emoji Control</h4>
                          <p className="text-gray-300 text-xs">Enable/disable emojis with filtering</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Hash className="h-5 w-5 text-blue-400" />
                        <div>
                          <h4 className="font-semibold text-white text-sm">Hashtag Control</h4>
                          <p className="text-gray-300 text-xs">Generate platform-specific hashtags</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BILLING & USAGE SECTIONS */}
              
              {/* Billing Overview */}
              <div id="billing-overview" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <CreditCard className="h-6 w-6 text-[#72c306] mr-3" />
                  Billing Overview
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Comprehensive billing system with subscription management, usage tracking, auto-renewal, and payment history.
                  All billing is processed in Indonesian Rupiah (IDR) with automatic wallet deduction.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl border border-green-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Core Features</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Automatic subscription billing</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Real-time usage synchronization</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Auto-renewal with wallet balance check</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Usage analytics by model & endpoint</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl border border-green-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Billing Cycles</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><Calendar className="h-4 w-4 text-[#72c306] mr-2" />Monthly billing (default)</li>
                      <li className="flex items-center"><Calendar className="h-4 w-4 text-[#72c306] mr-2" />Yearly billing (with discounts)</li>
                      <li className="flex items-center"><Repeat className="h-4 w-4 text-[#72c306] mr-2" />Smart auto-renewal system</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Immediate or period-end cancellation</li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">Available Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400">OVERVIEW</span>
                        <span className="text-gray-300 text-sm">View billing overview</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400">USAGE</span>
                        <span className="text-gray-300 text-sm">Monitor usage statistics</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-orange-500/20 text-orange-400">HISTORY</span>
                        <span className="text-gray-300 text-sm">Access payment history</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-purple-500/20 text-purple-400">UPGRADE</span>
                        <span className="text-gray-300 text-sm">Upgrade subscription plans</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Tracking */}
              <div id="usage-tracking" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Activity className="h-6 w-6 text-[#72c306] mr-3" />
                  Usage Tracking
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Real-time API usage tracking with comprehensive analytics across timeframes, models, and endpoints.
                  Includes token consumption monitoring and error tracking for performance optimization.
                </p>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Timeframe Analytics</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Today's usage statistics</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Weekly usage trends</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Monthly usage aggregation</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Daily usage chart visualization</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Model Analytics</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Usage by AI model (Gemini 2.5 Pro, etc.)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Token consumption per model</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Request count breakdown</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Model performance comparison</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Endpoint Analytics</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Usage by API endpoint</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Success vs failure rates</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Error tracking and analysis</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Performance metrics</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-900/50 border border-[#72c306]/30 rounded-xl">
                    <h3 className="text-xl font-bold text-[#72c306] mb-4">User Experience Features</h3>
                    <div className="space-y-3 text-gray-300 text-sm">
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Smart Monitoring:</strong> Our system ensures accurate usage tracking and fair billing for all users.
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Reliable Service:</strong> Only successful requests count toward your quota, protecting you from system errors.
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Real-Time Updates:</strong> Track your usage and token consumption in real-time with comprehensive analytics.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div id="payment-history" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <DollarSign className="h-6 w-6 text-[#72c306] mr-3" />
                  Payment History
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Complete payment transaction history with detailed filtering, status tracking, and formatted currency display.
                  Supports pagination and includes subscription, wallet top-up, and deduction transactions.
                </p>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Payment Types</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><ArrowUpRight className="h-4 w-4 text-red-500 mr-2" />SUBSCRIPTION: Plan upgrades & renewals</li>
                        <li className="flex items-center"><ArrowDownLeft className="h-4 w-4 text-green-500 mr-2" />WALLET_TOPUP: Balance additions</li>
                        <li className="flex items-center"><ArrowUpRight className="h-4 w-4 text-orange-500 mr-2" />DEDUCTION: Manual balance reductions</li>
                        <li className="flex items-center"><ArrowDownLeft className="h-4 w-4 text-blue-500 mr-2" />REFUND: Payment reversals</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Payment Status</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />COMPLETED: Successfully processed</li>
                        <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />PENDING: Awaiting processing</li>
                        <li className="flex items-center"><XCircle className="h-4 w-4 text-red-500 mr-2" />FAILED: Processing failed</li>
                        <li className="flex items-center"><ArrowDownLeft className="h-4 w-4 text-blue-500 mr-2" />REFUNDED: Amount refunded</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-900/50 border border-[#72c306]/30 rounded-xl">
                    <h3 className="text-xl font-bold text-[#72c306] mb-4">Payment Methods</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>wallet_balance:</strong> Direct wallet deduction for subscriptions
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>online_payment:</strong> Secure online payment processing
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Management */}
              <div id="subscription-management" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Settings className="h-6 w-6 text-[#72c306] mr-3" />
                  Subscription Management
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Advanced subscription lifecycle management with upgrade validation, auto-renewal processing,
                  and intelligent business rules to prevent downgrade losses.
                </p>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Subscription Features</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Plan upgrade with validation</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Auto-renewal toggle control</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Immediate or period-end cancellation</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Usage quota reset on renewal</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Business Rules</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Smart downgrade protection for fair usage</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Wallet balance validation before upgrade</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Automatic suspension on failed renewal</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Plan hierarchy enforcement</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-900/50 border border-[#72c306]/30 rounded-xl">
                    <h3 className="text-xl font-bold text-[#72c306] mb-4">Auto-Renewal System</h3>
                    <div className="space-y-3 text-gray-300 text-sm">
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Auto-Renewal:</strong> Convenient automatic subscription renewal to ensure uninterrupted service access.
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Balance Management:</strong> Automatic wallet balance verification and subscription management.
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Flexible Billing:</strong> Support for monthly and yearly billing cycles with easy plan upgrades.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* WALLET & SUBSCRIPTION PLAN SECTIONS */}
              
              {/* Wallet Overview */}
              <div id="wallet-overview" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Wallet className="h-6 w-6 text-[#72c306] mr-3" />
                  Wallet Overview
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Comprehensive wallet management system with automatic creation, balance tracking, and transaction management.
                  All monetary values are handled in Indonesian Rupiah (IDR) with proper currency formatting.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Core Features</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Automatic wallet creation on user registration</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Real-time balance tracking</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Comprehensive transaction history</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />User wallet management and top-up</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Wallet Statistics</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><DollarSign className="h-4 w-4 text-[#72c306] mr-2" />Current balance with currency formatting</li>
                      <li className="flex items-center"><ArrowDownLeft className="h-4 w-4 text-green-500 mr-2" />Total deposited (lifetime credits)</li>
                      <li className="flex items-center"><ArrowUpRight className="h-4 w-4 text-red-500 mr-2" />Total spent (lifetime debits)</li>
                      <li className="flex items-center"><BarChart3 className="h-4 w-4 text-[#72c306] mr-2" />Transaction trend visualization</li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">Available Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400">WALLET</span>
                        <span className="text-gray-300 text-sm">View wallet information</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400">STATS</span>
                        <span className="text-gray-300 text-sm">Check wallet statistics</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-orange-500/20 text-orange-400">HISTORY</span>
                        <span className="text-gray-300 text-sm">View transaction history</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Transactions */}
              <div id="wallet-transactions" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Activity className="h-6 w-6 text-[#72c306] mr-3" />
                  Wallet Transactions
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Detailed transaction tracking with proper credit/debit handling, payment method identification,
                  and comprehensive filtering. Includes automatic wallet creation and balance management.
                </p>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Transaction Processing</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Secure transaction processing</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Automatic balance calculation</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Transaction history logging</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Currency formatting (IDR)</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">User Capabilities</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />View wallet balance and statistics</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Access transaction history</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Top up wallet balance</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Monitor usage and expenses</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-900/50 border border-[#72c306]/30 rounded-xl">
                    <h3 className="text-xl font-bold text-[#72c306] mb-4">Transaction Display Logic</h3>
                    <div className="space-y-3 text-gray-300 text-sm">
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>User Transactions:</strong> View personal transaction history with filtering options for payment types and time periods.
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Balance Management:</strong> Top up wallet balance through various payment methods and monitor spending patterns.
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Payment Methods:</strong> Support for multiple payment gateways with automatic processing and confirmation.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Plans */}
              <div id="subscription-plans" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Crown className="h-6 w-6 text-[#72c306] mr-3" />
                  Subscription Plans
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Three-tier subscription system with FREE, BASIC, PRO, and ENTERPRISE plans. Each plan includes specific request limits,
                  pricing in IDR, and comprehensive feature sets designed for Indonesian SMEs.
                </p>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">FREE Plan</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Starter features for new users</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Free to get started</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Basic AI features access</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Perfect for testing the platform</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">BASIC Plan</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Enhanced features for small businesses</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Affordable monthly pricing</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Expanded AI capabilities</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Most popular choice for SMEs</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">PRO & ENTERPRISE</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Advanced features for growing businesses</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Professional pricing tiers available</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Premium features & priority support</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Custom API integration options</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-900/50 border border-[#72c306]/30 rounded-xl">
                    <h3 className="text-xl font-bold text-[#72c306] mb-4">Plan Management System</h3>
                    <div className="space-y-3 text-gray-300 text-sm">
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Flexible Plans:</strong> Multiple subscription tiers designed to grow with your business needs.
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Affordable Pricing:</strong> Competitive pricing designed specifically for Indonesian small and medium enterprises.
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Usage Tracking:</strong> Transparent usage monitoring with clear request limits and automatic quota management.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Management */}
              <div id="plan-management" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Settings className="h-6 w-6 text-[#72c306] mr-3" />
                  Plan Management
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Advanced subscription plan management with upgrade validation, downgrade protection,
                  and comprehensive billing cycle management (monthly/yearly) with automatic pricing calculations.
                </p>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Upgrade System</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Upgrade preview with cost calculation</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Wallet balance validation</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Plan hierarchy enforcement</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Immediate activation</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Trial Management</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Flexible trial periods available</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Maximum trial user limits</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Conversion tracking & statistics</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Automatic trial expiry handling</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-900/50 border border-[#72c306]/30 rounded-xl">
                    <h3 className="text-xl font-bold text-[#72c306] mb-4">Subscription Validation</h3>
                    <div className="space-y-3 text-gray-300 text-sm">
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Plan Upgrades:</strong> Easy subscription upgrades with immediate activation and enhanced features.
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Fair Usage:</strong> Flexible upgrade policies designed to protect your investment and maximize value.
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded">
                        <strong>Subscription Control:</strong> Full control over your subscription with easy renewal management and cancellation options.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BUSINESS ANALYTICS SECTIONS */}
              
              {/* Analytics Overview */}
              <div id="analytics-overview" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <BarChart3 className="h-6 w-6 text-[#72c306] mr-3" />
                  Business Analytics Overview
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Comprehensive business intelligence platform with real-time insights and ROI tracking.
                </p>

                <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span className="text-yellow-500 font-semibold">Coming Soon!</span>
                  </div>
                  <p className="text-gray-300 mb-2">
                    Business Analytics features are currently in development and will be available in the next major update.
                  </p>
                  <p className="text-yellow-400 text-sm">
                    ⚠️ This section shows planned features. Current analytics are available through Billing & Usage section.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20 opacity-60">
                    <h3 className="text-xl font-bold text-white mb-4">Core Metrics (Planned)</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />API usage and costs</li>
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />Customer engagement rates</li>
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />Content performance</li>
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />Revenue attribution</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20 opacity-60">
                    <h3 className="text-xl font-bold text-white mb-4">Real-time Data (Planned)</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />Live visitor tracking</li>
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />Instant updates</li>
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />Automated alerts</li>
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />Multi-platform sync</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Analytics Dashboard */}
              <div id="analytics-dashboard" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <PieChart className="h-6 w-6 text-[#72c306] mr-3" />
                  Dashboard
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Interactive dashboard providing real-time metrics and performance tracking.
                </p>

                <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-500 font-medium text-sm">Feature In Development</span>
                  </div>
                  <p className="text-yellow-400 text-sm">
                    Advanced analytics dashboard will be available in the upcoming release.
                  </p>
                </div>

                <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl opacity-60">
                  <h3 className="text-xl font-bold text-white mb-4">Dashboard Features (Planned)</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <LineChart className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-400">Real-time Charts</h4>
                      <p className="text-gray-500 text-sm">Live data visualization</p>
                    </div>
                    <div className="text-center">
                      <Target className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-400">Goal Tracking</h4>
                      <p className="text-gray-500 text-sm">Monitor progress against targets</p>
                    </div>
                    <div className="text-center">
                      <Users className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-400">User Behavior</h4>
                      <p className="text-gray-500 text-sm">Analyze customer interactions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Reports */}
              <div id="analytics-reports" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <FileBarChart className="h-6 w-6 text-[#72c306] mr-3" />
                  Reports
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Generate detailed custom reports with advanced filtering and data visualization.
                </p>

                <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-500 font-medium text-sm">Feature In Development</span>
                  </div>
                  <p className="text-yellow-400 text-sm">
                    Advanced reporting system with custom filters and export options will be available soon.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl opacity-60">
                    <h3 className="text-xl font-bold text-gray-400 mb-4">Report Types (Planned)</h3>
                    <ul className="space-y-2 text-gray-500">
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />Performance summary reports</li>
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />Audience demographic analysis</li>
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />Campaign effectiveness reports</li>
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />ROI and revenue reports</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl opacity-60">
                    <h3 className="text-xl font-bold text-gray-400 mb-4">Export Options (Planned)</h3>
                    <ul className="space-y-2 text-gray-500">
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />PDF reports with charts</li>
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />Excel/CSV data export</li>
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />Automated email delivery</li>
                      <li className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-2" />API data access</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ACCOUNT SETTINGS SECTIONS */}
              
              {/* Account Settings Overview */}
              <div id="account-overview" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Settings className="h-6 w-6 text-[#72c306] mr-3" />
                  Account Settings Overview
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Comprehensive account management system with profile settings, password security, and OAuth provider management.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20">
                    <User className="h-8 w-8 text-blue-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Profile Management</h3>
                    <p className="text-gray-300 text-sm">Update personal information and account details</p>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl border border-red-500/20">
                    <Shield className="h-8 w-8 text-red-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Security Management</h3>
                    <p className="text-gray-300 text-sm">Password management with dual authentication</p>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl border border-green-500/20">
                    <Globe className="h-8 w-8 text-green-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">OAuth Integration</h3>
                    <p className="text-gray-300 text-sm">GitHub and Google account integration</p>
                  </div>
                </div>
              </div>

              {/* Profile Management */}
              <div id="profile-management" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <User className="h-6 w-6 text-[#72c306] mr-3" />
                  Profile Management
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  User profile management with comprehensive validation and security features.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Profile Data</h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Unique user identification</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Email address (immutable)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Full name (editable)</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Account type management</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Account Creation</h3>
                    <ol className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#72c306] text-black font-bold mr-2 mt-0.5 text-xs">1</span>
                        <span>User registration with validation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#72c306] text-black font-bold mr-2 mt-0.5 text-xs">2</span>
                        <span>Automatic FREE plan subscription</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#72c306] text-black font-bold mr-2 mt-0.5 text-xs">3</span>
                        <span>Wallet creation with zero balance</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Password & Security */}
              <div id="password-security" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Shield className="h-6 w-6 text-[#72c306] mr-3" />
                  Password & Security
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Advanced password management system with Argon2 hashing and safety checks.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl border border-red-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Password Operations</h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-center"><Lock className="h-4 w-4 text-[#72c306] mr-2" />Set Password (OAuth users)</li>
                      <li className="flex items-center"><Key className="h-4 w-4 text-[#72c306] mr-2" />Change Password (existing users)</li>
                      <li className="flex items-center"><Mail className="h-4 w-4 text-[#72c306] mr-2" />Password Reset via email</li>
                      <li className="flex items-center"><Shield className="h-4 w-4 text-[#72c306] mr-2" />Current password validation</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl border border-red-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Security Features</h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Argon2 password hashing</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />8+ character minimum</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Secure token sessions</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Account lockout prevention</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* OAuth Providers */}
              <div id="oauth-providers" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Globe className="h-6 w-6 text-[#72c306] mr-3" />
                  OAuth Providers
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  OAuth provider management with GitHub and Google integration. Features safety checks to prevent account lockout.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Supported Providers</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Github className="h-6 w-6 text-white" />
                        <div>
                          <h4 className="font-semibold text-white">GitHub</h4>
                          <p className="text-gray-300 text-sm">Connect GitHub account for authentication</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Chrome className="h-6 w-6 text-white" />
                        <div>
                          <h4 className="font-semibold text-white">Google</h4>
                          <p className="text-gray-300 text-sm">Connect Google account for easy sign-in</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Safety Features</h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Disconnect prevention</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Multiple provider support</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Account linking by email</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-[#72c306] mr-2" />Connection tracking</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* API REFERENCE SECTIONS */}
              
              {/* API Authentication */}
              <div id="api-auth" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Key className="h-6 w-6 text-[#72c306] mr-3" />
                  Authentication
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Secure authentication system using API keys with role-based access control.
                </p>

                <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span className="text-yellow-500 font-semibold">Coming Soon!</span>
                  </div>
                  <p className="text-gray-300 mb-2">
                    API key-based authentication system is currently in development.
                  </p>
                  <p className="text-yellow-400 text-sm">
                    ⚠️ Currently, all API access uses JWT token authentication through the web dashboard.
                  </p>
                </div>

                <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl opacity-60">
                  <h3 className="text-xl font-bold text-gray-400 mb-4">Authentication Flow (Planned)</h3>
                  <ol className="space-y-3 text-gray-500">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-gray-300 font-bold mr-3 mt-0.5 text-sm">1</span>
                      <div>
                        <strong className="text-gray-400">Generate API Key</strong>
                        <p className="text-sm text-gray-500">Create your API key from the dashboard</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-gray-300 font-bold mr-3 mt-0.5 text-sm">2</span>
                      <div>
                        <strong className="text-gray-400">Include in Headers</strong>
                        <p className="text-sm text-gray-500">Add Authorization header to all requests</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-gray-300 font-bold mr-3 mt-0.5 text-sm">3</span>
                      <div>
                        <strong className="text-gray-400">Make API Calls</strong>
                        <p className="text-sm text-gray-500">Start using NusantaraX services</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Service Access */}
              <div id="api-endpoints" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Globe className="h-6 w-6 text-[#72c306] mr-3" />
                  Service Access
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Access all NusantaraX features through our intuitive web dashboard. All services are designed for easy use without technical knowledge.
                </p>

                <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    <span className="text-blue-500 font-semibold">Easy Access Available</span>
                  </div>
                  <p className="text-gray-300 mb-2">
                    All features are accessible through our user-friendly web dashboard. Simply log in and start using our AI-powered tools.
                  </p>
                  <p className="text-blue-400 text-sm">
                    💡 Advanced API access will be available for developers in future updates.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Available Services</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                          <h4 className="font-semibold text-white mb-2 flex items-center">
                            <Bot className="h-5 w-5 text-[#72c306] mr-2" />
                            AI Assistant
                          </h4>
                          <p className="text-gray-300 text-sm">Chat with AI for digital marketing advice, upload images for analysis, and configure business context.</p>
                        </div>
                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                          <h4 className="font-semibold text-white mb-2 flex items-center">
                            <ImageIcon className="h-5 w-5 text-[#72c306] mr-2" />
                            Image Generator
                          </h4>
                          <p className="text-gray-300 text-sm">Generate professional product images using templates or custom prompts.</p>
                        </div>
                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                          <h4 className="font-semibold text-white mb-2 flex items-center">
                            <MessageSquare className="h-5 w-5 text-[#72c306] mr-2" />
                            Caption Generator
                          </h4>
                          <p className="text-gray-300 text-sm">Create engaging social media captions with performance scoring.</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                          <h4 className="font-semibold text-white mb-2 flex items-center">
                            <Briefcase className="h-5 w-5 text-[#72c306] mr-2" />
                            Business Information
                          </h4>
                          <p className="text-gray-300 text-sm">Manage your business profile, brand identity, and AI configuration settings.</p>
                        </div>
                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                          <h4 className="font-semibold text-white mb-2 flex items-center">
                            <CreditCard className="h-5 w-5 text-[#72c306] mr-2" />
                            Billing & Usage
                          </h4>
                          <p className="text-gray-300 text-sm">Monitor usage, view billing history, and manage subscription plans.</p>
                        </div>
                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                          <h4 className="font-semibold text-white mb-2 flex items-center">
                            <User className="h-5 w-5 text-[#72c306] mr-2" />
                            Account Settings
                          </h4>
                          <p className="text-gray-300 text-sm">Update profile, manage passwords, and configure OAuth providers.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Examples */}
              <div id="api-examples" className="space-y-6 mb-16">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Code className="h-6 w-6 text-[#72c306] mr-3" />
                  Examples
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Practical code examples and implementation guides for common use cases.
                </p>

                <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span className="text-yellow-500 font-semibold">SDK Coming Soon!</span>
                  </div>
                  <p className="text-gray-300 mb-2">
                    The NusantaraX SDK and complete integration examples are currently in development.
                  </p>
                  <p className="text-yellow-400 text-sm">
                    ⚠️ For now, access all features through the web dashboard. SDK will be available in the next update.
                  </p>
                </div>

                <div className="p-6 bg-black/50 border border-gray-700/50 rounded-xl opacity-60">
                  <h3 className="text-xl font-bold text-gray-400 mb-4">Complete Integration Example (Preview)</h3>
                  <div className="p-4 bg-gray-900/80 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-400">Full Integration Code (Coming Soon)</span>
                      <button
                        disabled
                        className="flex items-center space-x-2 px-3 py-1 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="text-xs">Copy</span>
                      </button>
                    </div>
                    <pre className="text-sm text-gray-500 overflow-x-auto">
                      <code>{`// Complete NusantaraX Integration (Preview)
import { NusantaraXClient } from '@nusantarax/sdk'; // Coming soon

const client = new NusantaraXClient({
  apiKey: process.env.NUSANTARAX_API_KEY, // Coming soon
  environment: 'production'
});

// Profile management
const profile = await client.profile.getProfile();
console.log('User profile:', profile.data);

// Image generation from template
const templateResult = await client.imageGenerator.generateFromTemplate({
  templateId: 'food-product-showcase',
  inputFields: { productName: 'Rendang Padang' },
  aspectRatio: '3:4',
  imageCount: 6
});

// Caption generation
const formData = new FormData();
formData.append('image', imageFile);
formData.append('platform', 'INSTAGRAM');
formData.append('tone', 'CASUAL');
formData.append('language', 'ID');

const captionResult = await client.captionGenerator.generate(formData);

console.log('Generated content:', {
  images: templateResult.data.results,
  captions: captionResult.data.results
});`}</code>
                    </pre>
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      {/* Floating Mascot */}
      <FloatingMascot />
    </div>
  );
};

export default DocumentationPage;