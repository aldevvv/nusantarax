'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
  UserCheck,
  FileText,
  Mail,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Users,
  Settings,
  Smartphone,
  Cloud,
  Key,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvancedNavbar from '@/components/layout/AdvancedNavbar';
import FloatingMascot from '@/components/ui/FloatingMascot';

const PrivacyPolicyPage = () => {
  const lastUpdated = "September 23, 2025";

  const policySections = [
    {
      id: 'overview',
      title: 'Privacy Overview',
      icon: <Shield className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Our Commitment',
          text: 'At NusantaraX, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered SaaS platform designed for Indonesian SMEs.'
        },
        {
          subtitle: 'Scope of Policy',
          text: 'This policy applies to all users of the NusantaraX platform, including our AI Assistant, Image Generator, Caption Generator, Business Analytics tools, and related services. By using our platform, you consent to the data practices described in this policy.'
        }
      ]
    },
    {
      id: 'data-collection',
      title: 'Information We Collect',
      icon: <Database className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Personal Information',
          text: 'We collect information you provide directly, including your name, email address, business information, and content you submit through our AI services.',
          list: [
            'Account registration information (full name, email, Argon2-hashed passwords)',
            'Business profile data (business name, category, industry, brand colors, logo)',
            'Payment and wallet information processed via Midtrans (Indonesian payment gateway)',
            'OAuth provider information (GitHub, Google account linking)',
            'Communication preferences and support interactions'
          ]
        },
        {
          subtitle: 'AI Service Data',
          text: 'When you use our AI services powered by Google Gemini 2.5 Pro and Imagen 4.0, we collect and process:',
          list: [
            'Text inputs for AI Assistant conversations (stored with 24-hour image cache)',
            'Image generation prompts and business context for Imagen 4.0 processing',
            'Image uploads for caption generation (stored in Supabase with automatic cleanup)',
            'Business information for AI context personalization',
            'Token usage analytics and API call logs for billing and optimization'
          ]
        },
        {
          subtitle: 'Technical Information',
          text: 'We automatically collect technical data to improve our services:',
          list: [
            'Device information and browser type',
            'IP address and location data (for service optimization)',
            'Usage patterns and feature interactions',
            'Performance metrics and error logs'
          ]
        }
      ]
    },
    {
      id: 'data-usage',
      title: 'How We Use Your Information',
      icon: <Settings className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Service Provision',
          text: 'We use your information to provide, maintain, and improve our AI-powered services:',
          list: [
            'Deliver specialized digital marketing advice through AI Assistant (Gemini 2.5 Pro)',
            'Generate professional images using Imagen 4.0 (1-12 images per request)',
            'Create platform-specific captions with 10-metric scoring system',
            'Manage business information and brand identity for AI context',
            'Process payments through Midtrans and manage wallet-based subscriptions',
            'Track token usage and API analytics for billing and optimization'
          ]
        },
        {
          subtitle: 'Platform Enhancement',
          text: 'Your data helps us enhance the NusantaraX platform:',
          list: [
            'Improve AI model accuracy and relevance',
            'Develop new features and capabilities',
            'Optimize performance and user experience',
            'Ensure platform security and reliability'
          ]
        },
        {
          subtitle: 'Communication',
          text: 'We may use your contact information to:',
          list: [
            'Send service updates and important notifications',
            'Provide customer support and technical assistance',
            'Share relevant product updates and features',
            'Conduct satisfaction surveys and feedback collection'
          ]
        }
      ]
    },
    {
      id: 'data-sharing',
      title: 'Information Sharing',
      icon: <Users className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Third-Party Services',
          text: 'We work with trusted partners to provide our services:',
          list: [
            'Google Gemini API and Imagen 4.0 for AI processing and image generation',
            'Supabase for secure database and file storage infrastructure',
            'Midtrans for payment processing and billing management',
            'Resend for transactional email delivery',
            'GitHub and Google OAuth for secure authentication'
          ]
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose information when required by law or to:',
          list: [
            'Comply with Indonesian data protection regulations',
            'Respond to legal processes and government requests',
            'Protect our rights, property, or safety',
            'Prevent fraud and ensure platform security'
          ]
        },
        {
          subtitle: 'Business Transfers',
          text: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction, subject to the same privacy protections.'
        }
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: <Lock className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Security Measures',
          text: 'We implement comprehensive security measures to protect your data:',
          list: [
            'Argon2 password hashing for all user accounts',
            'JWT-based authentication with secure token sessions',
            'Supabase infrastructure with PostgreSQL database encryption',
            'Role-based access controls (USER/ADMIN) with guard protection',
            'HTTPS encryption for all data transmission',
            'OAuth integration with GitHub and Google for secure authentication'
          ]
        },
        {
          subtitle: 'AI Data Processing',
          text: 'Special protections for AI service data processed through Google Gemini and Imagen:',
          list: [
            'Temporary image cache with automatic 24-hour deletion for AI Assistant',
            'Secure Supabase storage buckets for image uploads and generated content',
            'Token usage tracking for billing transparency (analytics only)',
            'Business context data encryption and secure processing',
            'Automatic cleanup of expired cached data',
            'Restricted access to AI processing endpoints with authentication'
          ]
        }
      ]
    },
    {
      id: 'user-rights',
      title: 'Your Rights',
      icon: <UserCheck className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Data Access and Control',
          text: 'You have the following rights regarding your personal data:',
          list: [
            'Access: Request a copy of your personal data',
            'Correction: Update or correct inaccurate information',
            'Deletion: Request deletion of your personal data',
            'Portability: Export your data in a machine-readable format',
            'Restriction: Limit how we process your information'
          ]
        },
        {
          subtitle: 'Marketing Communications',
          text: 'You can opt-out of marketing communications at any time through your account settings or by contacting our support team. Essential service communications will continue as needed.'
        },
        {
          subtitle: 'Account Management',
          text: 'You can manage your privacy settings, download your data, or delete your account through the dashboard settings or by contacting support at support@nusantarax.web.id.'
        }
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      icon: <Eye className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Cookie Usage',
          text: 'We use cookies and similar technologies to enhance your experience:',
          list: [
            'Essential cookies for platform functionality',
            'Analytics cookies to understand usage patterns',
            'Preference cookies to remember your settings',
            'Security cookies for authentication and protection'
          ]
        },
        {
          subtitle: 'Cookie Management',
          text: 'You can control cookies through your browser settings. Disabling certain cookies may limit platform functionality. We respect your privacy choices and provide clear options for cookie management.'
        }
      ]
    },
    {
      id: 'international',
      title: 'International Transfers',
      icon: <Globe className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Global Infrastructure',
          text: 'NusantaraX operates using Supabase infrastructure and Google AI services. Your data may be processed in data centers located outside Indonesia, including:',
          list: [
            'Supabase (AWS) Asia-Pacific regions for database and file storage',
            'Google Cloud Platform (United States) for Gemini 2.5 Pro and Imagen 4.0 processing',
            'Midtrans (Indonesia) for local payment processing'
          ]
        },
        {
          subtitle: 'Data Protection Standards',
          text: 'All international data transfers are protected by appropriate safeguards, including standard contractual clauses, adequacy decisions, and compliance with Indonesian data protection laws.'
        }
      ]
    },
    {
      id: 'contact-dpo',
      title: 'Contact Information',
      icon: <Mail className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Privacy Questions',
          text: 'For any privacy-related questions or concerns, please contact us:',
          list: [
            'Email: privacy@nusantarax.web.id',
            'Support: support@nusantarax.web.id',
            'Address: Jl. Cokonuri Raya Dalam 1, Rappocini, Makassar',
            'Phone: +6289643143750'
          ]
        },
        {
          subtitle: 'Response Time',
          text: 'We are committed to responding to privacy inquiries within 72 hours and resolving issues within 30 days, in compliance with applicable data protection regulations.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <AdvancedNavbar />
      
      {/* Hero Header Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-[#72c306]/10 border border-[#72c306]/30 rounded-full px-6 py-2 mb-8"
            >
              <Shield className="h-4 w-4 text-[#72c306]" />
              <span className="text-[#72c306] text-sm font-medium">Privacy Policy</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            >
              <span className="text-white">Your Privacy is</span>
              <br />
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                Our Priority
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              We are committed to protecting your personal information and being transparent 
              about how we collect, use, and safeguard your data.
            </motion.p>

            {/* Last Updated */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="inline-flex items-center space-x-2 bg-black/50 border border-gray-700/50 rounded-full px-4 py-2"
            >
              <Clock className="h-4 w-4 text-[#72c306]" />
              <span className="text-sm text-gray-300">Last updated: {lastUpdated}</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#72c306]/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#8fd428]/10 rounded-full blur-3xl"
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            {/* Privacy Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-4 gap-6 mb-16"
            >
              {[
                {
                  icon: <Lock className="h-8 w-8" />,
                  title: "Data Encryption",
                  description: "End-to-end encryption for all data"
                },
                {
                  icon: <Shield className="h-8 w-8" />,
                  title: "Enterprise Security",
                  description: "Bank-grade security standards"
                },
                {
                  icon: <UserCheck className="h-8 w-8" />,
                  title: "User Control",
                  description: "Full control over your data"
                },
                {
                  icon: <Globe className="h-8 w-8" />,
                  title: "Global Compliance",
                  description: "GDPR and Indonesian law compliant"
                }
              ].map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-6 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/5 rounded-2xl border border-[#72c306]/20 text-center group hover:border-[#72c306]/40 transition-all duration-300"
                >
                  <div className="text-[#72c306] mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                    {highlight.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{highlight.title}</h3>
                  <p className="text-sm text-gray-300">{highlight.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Policy Sections */}
            <div className="space-y-12">
              {policySections.map((section, sectionIndex) => (
                <motion.div
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: sectionIndex * 0.1 }}
                  className="p-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-3xl border border-gray-700/50 backdrop-blur-sm"
                >
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-[#72c306]/20 rounded-xl mr-4">
                      <div className="text-[#72c306]">
                        {section.icon}
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                  </div>

                  <div className="space-y-6">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <h3 className="text-xl font-semibold text-white mb-3">{item.subtitle}</h3>
                        <p className="text-gray-300 leading-relaxed mb-4">{item.text}</p>
                        {item.list && (
                          <ul className="space-y-2">
                            {item.list.map((listItem, listIndex) => (
                              <li key={listIndex} className="flex items-start text-gray-300">
                                <CheckCircle2 className="h-5 w-5 text-[#72c306] mr-3 mt-0.5 flex-shrink-0" />
                                {listItem}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Data Retention Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-12 p-8 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/5 rounded-3xl border border-[#72c306]/20"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-[#72c306]/20 rounded-xl mr-4">
                  <Database className="h-6 w-6 text-[#72c306]" />
                </div>
                <h2 className="text-3xl font-bold text-white">Data Retention</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Retention Periods</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                      <span className="text-gray-300">Account Data</span>
                      <span className="text-[#72c306] font-semibold">Active + 3 years</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                      <span className="text-gray-300">AI Assistant Images</span>
                      <span className="text-[#72c306] font-semibold">24 hours (auto-delete)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                      <span className="text-gray-300">Generated Content</span>
                      <span className="text-[#72c306] font-semibold">User controlled</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                      <span className="text-gray-300">API Call Logs</span>
                      <span className="text-[#72c306] font-semibold">1 year</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                      <span className="text-gray-300">Payment History</span>
                      <span className="text-[#72c306] font-semibold">7 years (tax compliance)</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Automatic Deletion</h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    We automatically delete or anonymize personal data when it's no longer needed 
                    for the purposes for which it was collected, unless we're required to retain 
                    it for legal or regulatory reasons.
                  </p>
                  <div className="flex items-center space-x-2 text-[#72c306]">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Automated deletion processes</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Policy Updates */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-12 p-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-3xl border border-gray-700/50"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-[#72c306]/20 rounded-xl mr-4">
                  <AlertTriangle className="h-6 w-6 text-[#72c306]" />
                </div>
                <h2 className="text-3xl font-bold text-white">Policy Updates</h2>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-6">
                We may update this Privacy Policy from time to time to reflect changes in our practices, 
                technology, legal requirements, or other factors. We will notify you of any material 
                changes through email notification or prominent notice on our platform.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-[#72c306]/10 rounded-xl border border-[#72c306]/20">
                  <h4 className="font-semibold text-white mb-2">Material Changes</h4>
                  <p className="text-sm text-gray-300">30-day advance notice via email</p>
                </div>
                <div className="p-4 bg-[#72c306]/10 rounded-xl border border-[#72c306]/20">
                  <h4 className="font-semibold text-white mb-2">Minor Updates</h4>
                  <p className="text-sm text-gray-300">Updated on website with notification</p>
                </div>
              </div>
            </motion.div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-16 text-center"
            >
              <div className="p-12 bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 rounded-3xl border border-[#72c306]/30">
                <h2 className="text-3xl font-bold text-white mb-4">Questions About Our Privacy Policy?</h2>
                <p className="text-xl text-gray-300 mb-8">
                  Our privacy team is here to help. Contact us for any questions or concerns.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25"
                    asChild
                  >
                    <Link href="/contact">
                      Contact Privacy Team
                      <Mail className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25"
                    asChild
                  >
                    <Link href="/documentation">
                      View Documentation
                      <BookOpen className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-16 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8 text-center md:text-left">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <img
                  src="https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/NusantaraXX.png"
                  alt="NusantaraX Logo"
                  className="h-10 w-10 object-contain"
                />
                <div className="-ml-2">
                  <div className="text-xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                    NusantaraX
                  </div>
                  <div className="text-xs text-gray-500">SMEs Digital Partner</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                #1 SaaS platform for Indonesian SME digitalization with cutting-edge AI technology.
              </p>
              <div className="flex justify-center md:justify-start space-x-4">
                <motion.a
                  href="#"
                  className="text-gray-400 hover:text-[#72c306] transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <Globe className="h-5 w-5" />
                </motion.a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="text-gray-400 hover:text-[#72c306] transition-colors">AI Assistant</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-[#72c306] transition-colors">Image Generator</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-[#72c306] transition-colors">Caption Generator</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-[#72c306] transition-colors">Business Analytics</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-400 hover:text-[#72c306] transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-[#72c306] transition-colors">About</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-[#72c306] transition-colors">Pricing</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-[#72c306] transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contact" className="text-gray-400 hover:text-[#72c306] transition-colors">Help Center</Link></li>
                <li><Link href="/documentation" className="text-gray-400 hover:text-[#72c306] transition-colors">Documentation</Link></li>
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-[#72c306] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="text-gray-400 hover:text-[#72c306] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-white font-semibold mb-4">Social Media</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="https://www.instagram.com/nusantarax.id/" className="text-gray-400 hover:text-[#72c306] transition-colors" target="_blank" rel="noopener noreferrer">Instagram</Link></li>
                <li><Link href="https://web.facebook.com/profile.php?id=61581421463583" className="text-gray-400 hover:text-[#72c306] transition-colors" target="_blank" rel="noopener noreferrer">Facebook</Link></li>
                <li><Link href="https://www.youtube.com/@nusantarax-id" className="text-gray-400 hover:text-[#72c306] transition-colors" target="_blank" rel="noopener noreferrer">YouTube</Link></li>
                <li><Link href="https://www.tiktok.com/nusantarax.id" className="text-gray-400 hover:text-[#72c306] transition-colors" target="_blank" rel="noopener noreferrer">TikTok</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Mascot */}
      <FloatingMascot />
    </div>
  );
};

export default PrivacyPolicyPage;