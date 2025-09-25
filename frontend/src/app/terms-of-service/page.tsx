'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Scale,
  Shield,
  CreditCard,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  Mail,
  BookOpen,
  Gavel,
  Lock,
  Users,
  Zap,
  Ban,
  RefreshCw,
  ArrowRight,
  Building,
  Eye,
  Database,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvancedNavbar from '@/components/layout/AdvancedNavbar';
import FloatingMascot from '@/components/ui/FloatingMascot';

const TermsOfServicePage = () => {
  const lastUpdated = "September 23, 2025";
  const effectiveDate = "September 23, 2025";

  const termsSections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: <CheckCircle2 className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Agreement to Terms',
          text: 'By accessing and using NusantaraX ("the Platform", "our Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
        },
        {
          subtitle: 'Platform Description',
          text: 'NusantaraX is a comprehensive SaaS platform designed specifically for Indonesian Small and Medium Enterprises (SMEs), providing AI-powered tools including AI Assistant, Image Generator, Caption Generator, and Business Analytics to enhance digital marketing capabilities and business efficiency.'
        },
        {
          subtitle: 'Eligibility',
          text: 'You must be at least 18 years old and have the legal capacity to enter into this agreement. By using our services, you represent and warrant that you meet these requirements.'
        }
      ]
    },
    {
      id: 'services',
      title: 'Description of Services',
      icon: <Zap className="h-6 w-6" />,
      content: [
        {
          subtitle: 'AI-Powered Tools',
          text: 'NusantaraX provides access to the following AI-powered services powered by Google AI technology:',
          list: [
            'AI Assistant: Specialized digital marketing expert powered by Gemini 2.5 Pro, exclusively focused on marketing advice',
            'Image Generator: Professional image creation using Imagen 4.0 with 1-12 images per generation and business context integration',
            'Caption Generator: Platform-specific social media captions with 10-metric scoring system and bilingual support (Indonesian/English)',
            'Business Information: Comprehensive business profile management with 18 categories and AI context integration',
            'Billing & Usage: Real-time usage tracking, subscription management, and wallet-based payment system',
            'Wallet Management: IDR-based payment system with Midtrans integration for Indonesian market'
          ]
        },
        {
          subtitle: 'Service Availability',
          text: 'We strive to maintain 99.9% uptime for our platform. However, services may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We will provide advance notice when possible.'
        },
        {
          subtitle: 'Service Modifications',
          text: 'We reserve the right to modify, suspend, or discontinue any part of our services at any time. We will provide reasonable notice for material changes that affect your use of the platform.'
        }
      ]
    },
    {
      id: 'user-obligations',
      title: 'User Obligations',
      icon: <User className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Acceptable Use',
          text: 'You agree to use NusantaraX only for lawful purposes and in accordance with these terms. You are responsible for all activity that occurs under your account.'
        },
        {
          subtitle: 'Prohibited Activities',
          text: 'You agree not to:',
          list: [
            'Use the platform for illegal activities or to violate any laws',
            'Generate content that is defamatory, harmful, or offensive',
            'Attempt to reverse engineer, hack, or compromise platform security',
            'Share your account credentials with unauthorized parties',
            'Upload malicious code, viruses, or harmful software',
            'Violate intellectual property rights of others',
            'Use the platform to compete directly with NusantaraX'
          ]
        },
        {
          subtitle: 'Content Responsibility',
          text: 'You are solely responsible for all content you submit, generate, or distribute through our platform. You warrant that you have the necessary rights and permissions for all content you use with our services.'
        }
      ]
    },
    {
      id: 'payment-terms',
      title: 'Payment and Billing',
      icon: <CreditCard className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Subscription Plans',
          text: 'NusantaraX offers four subscription tiers with actual request limits:',
          list: [
            'FREE Plan: Rp 0/month - 50 requests/month for basic testing',
            'BASIC Plan: Rp 15,000/month - 750 requests/month for small businesses',
            'PRO Plan: Rp 35,000/month - 5,000 requests/month for growing SMEs',
            'ENTERPRISE Plan: Rp 150,000/month - Unlimited requests for large organizations'
          ]
        },
        {
          subtitle: 'Wallet-Based Billing',
          text: 'All subscriptions are processed through your NusantaraX wallet. You must maintain sufficient wallet balance for automatic subscription renewals. Wallet top-ups are processed through Midtrans payment gateway.'
        },
        {
          subtitle: 'Payment Processing',
          text: 'Payments are processed through Midtrans, Indonesia\'s leading payment gateway. Supported methods include QRIS, SeaBank, AlloBank, BLU BCA, GOPAY, and DANA. All transactions are in Indonesian Rupiah (IDR).'
        },
        {
          subtitle: 'Late Payment',
          text: 'If payment is not received within 7 days of the due date, your account may be suspended until payment is made. Accounts suspended for more than 30 days may be terminated.'
        }
      ]
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      icon: <Shield className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Platform Ownership',
          text: 'NusantaraX owns all rights, title, and interest in the platform, including all software, algorithms, AI models, designs, and related intellectual property.'
        },
        {
          subtitle: 'User Content Rights',
          text: 'You retain ownership of content you create using our platform. However, you grant us a limited license to process, store, and deliver your content as necessary to provide our services.'
        },
        {
          subtitle: 'AI-Generated Content',
          text: 'Content generated by our AI tools (images, captions, responses) is provided "as-is" and you are responsible for ensuring appropriate use and compliance with applicable laws and third-party rights.'
        },
        {
          subtitle: 'Trademark Usage',
          text: 'The NusantaraX name, logo, and trademarks are our property. You may not use our trademarks without prior written permission.'
        }
      ]
    },
    {
      id: 'privacy-data',
      title: 'Privacy and Data Protection',
      icon: <Lock className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Data Collection',
          text: 'Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these terms by reference.'
        },
        {
          subtitle: 'Data Security',
          text: 'We implement industry-standard security measures including encryption, access controls, and regular security audits to protect your data.'
        },
        {
          subtitle: 'Indonesian Compliance',
          text: 'We comply with Indonesian data protection laws and regulations, including the Personal Data Protection Law (UU PDP) and related implementing regulations.'
        }
      ]
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: <AlertTriangle className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Service Disclaimer',
          text: 'NusantaraX is provided "as-is" and "as-available" without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or meet your specific requirements.'
        },
        {
          subtitle: 'Liability Limitations',
          text: 'To the maximum extent permitted by Indonesian law, our total liability to you for any claims arising from your use of the platform shall not exceed the amount you paid us in the twelve months preceding the claim.'
        },
        {
          subtitle: 'AI Content Disclaimer',
          text: 'AI-generated content is provided for assistance purposes only. You are responsible for reviewing, editing, and ensuring the appropriateness of all AI-generated content before use.'
        }
      ]
    },
    {
      id: 'termination',
      title: 'Account Termination',
      icon: <Ban className="h-6 w-6" />,
      content: [
        {
          subtitle: 'User Termination',
          text: 'You may terminate your account at any time by contacting our support team or through your account settings. Upon termination, your access to the platform will cease immediately.'
        },
        {
          subtitle: 'Our Termination Rights',
          text: 'We may suspend or terminate your account if you:',
          list: [
            'Violate these terms of service',
            'Engage in fraudulent or illegal activities',
            'Fail to pay subscription fees',
            'Misuse the platform or AI services',
            'Pose a security risk to other users'
          ]
        },
        {
          subtitle: 'Data After Termination',
          text: 'Upon account termination, we will delete your personal data within 30 days, except for data we are required to retain for legal or regulatory purposes.'
        }
      ]
    },
    {
      id: 'updates',
      title: 'Terms Updates',
      icon: <RefreshCw className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Modification Rights',
          text: 'We may update these terms from time to time to reflect changes in our services, legal requirements, or business practices. Material changes will be communicated with 30 days advance notice.'
        },
        {
          subtitle: 'Notification Process',
          text: 'Updates will be announced through email notification to your registered email address and prominent notice on our platform. Continued use after changes constitutes acceptance of the updated terms.'
        }
      ]
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      icon: <Gavel className="h-6 w-6" />,
      content: [
        {
          subtitle: 'Indonesian Jurisdiction',
          text: 'These terms are governed by and construed in accordance with the laws of the Republic of Indonesia. Any disputes arising from these terms or your use of the platform shall be subject to the exclusive jurisdiction of Indonesian courts.'
        },
        {
          subtitle: 'Dispute Resolution',
          text: 'Before pursuing formal legal action, we encourage users to contact our support team to resolve disputes amicably. For unresolved disputes, arbitration may be pursued under Indonesian arbitration law.'
        },
        {
          subtitle: 'Language',
          text: 'These terms are originally written in English. In case of translation into Bahasa Indonesia or other languages, the English version shall prevail in case of any conflicts.'
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
              <FileText className="h-4 w-4 text-[#72c306]" />
              <span className="text-[#72c306] text-sm font-medium">Terms of Service</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            >
              <span className="text-white">Terms of Service</span>
              <br />
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                Agreement
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Please read these terms carefully before using NusantaraX. 
              They govern your use of our AI-powered platform and services.
            </motion.p>

            {/* Effective Date */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <div className="inline-flex items-center space-x-2 bg-black/50 border border-gray-700/50 rounded-full px-4 py-2">
                <Clock className="h-4 w-4 text-[#72c306]" />
                <span className="text-sm text-gray-300">Effective: {effectiveDate}</span>
              </div>
              <div className="inline-flex items-center space-x-2 bg-black/50 border border-gray-700/50 rounded-full px-4 py-2">
                <RefreshCw className="h-4 w-4 text-[#72c306]" />
                <span className="text-sm text-gray-300">Last updated: {lastUpdated}</span>
              </div>
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

      {/* Key Points Summary */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Key Terms Summary</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <CreditCard className="h-8 w-8" />,
                  title: "Subscription Based",
                  description: "Monthly billing with 30-day money-back guarantee"
                },
                {
                  icon: <Shield className="h-8 w-8" />,
                  title: "Data Protection",
                  description: "Enterprise-grade security with Argon2 encryption"
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: "For SMEs",
                  description: "Designed specifically for Indonesian businesses"
                },
                {
                  icon: <Globe className="h-8 w-8" />,
                  title: "Indonesian Law",
                  description: "Governed by Republic of Indonesia laws"
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
            </div>
          </motion.div>

          {/* Terms Sections */}
          <div className="max-w-5xl mx-auto space-y-12">
            {termsSections.map((section, sectionIndex) => (
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

            {/* Additional Important Terms */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-2 gap-8"
            >
              <div className="p-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-3xl border border-gray-700/50">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-[#72c306]/20 rounded-xl mr-4">
                    <Building className="h-6 w-6 text-[#72c306]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Service Level Agreement</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300">Platform Uptime</span>
                    <span className="text-[#72c306] font-semibold">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300">Support Response</span>
                    <span className="text-[#72c306] font-semibold">{"<"} 24 hours</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300">Data Backup</span>
                    <span className="text-[#72c306] font-semibold">Daily</span>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-3xl border border-gray-700/50">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-[#72c306]/20 rounded-xl mr-4">
                    <Eye className="h-6 w-6 text-[#72c306]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Monitoring and Compliance</h2>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-[#72c306] mr-3 mt-0.5 flex-shrink-0" />
                    We monitor platform usage for security and performance
                  </li>
                  <li className="flex items-start text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-[#72c306] mr-3 mt-0.5 flex-shrink-0" />
                    Automated systems detect policy violations
                  </li>
                  <li className="flex items-start text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-[#72c306] mr-3 mt-0.5 flex-shrink-0" />
                    Regular compliance audits and reviews
                  </li>
                  <li className="flex items-start text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-[#72c306] mr-3 mt-0.5 flex-shrink-0" />
                    Transparent reporting on service incidents
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-16 text-center"
            >
              <div className="p-12 bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 rounded-3xl border border-[#72c306]/30">
                <h2 className="text-3xl font-bold text-white mb-4">Questions About These Terms?</h2>
                <p className="text-xl text-gray-300 mb-8">
                  Our legal team is available to clarify any aspects of these terms of service.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25"
                    asChild
                  >
                    <Link href="/contact">
                      Contact Legal Team
                      <Mail className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25"
                    asChild
                  >
                    <Link href="/privacy-policy">
                      View Privacy Policy
                      <Shield className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Legal Notice */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-12 p-6 bg-gray-900/50 border border-gray-700/50 rounded-xl"
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Important Legal Notice</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    These terms constitute a legally binding agreement between you and PT NusantaraX Indonesia. 
                    By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms. 
                    If you are entering into this agreement on behalf of a company or other legal entity, 
                    you represent that you have the authority to bind such entity to these terms.
                  </p>
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

export default TermsOfServicePage;