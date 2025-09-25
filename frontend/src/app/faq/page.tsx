'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Search,
  HelpCircle,
  Book,
  MessageSquare,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Star,
  Clock,
  Shield,
  Zap,
  Users,
  CreditCard,
  Settings,
  Download,
  Upload,
  BarChart3,
  Bot,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdvancedNavbar from '@/components/layout/AdvancedNavbar';

const FAQPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: <Book className="h-4 w-4" /> },
    { id: 'getting-started', name: 'Getting Started', icon: <Zap className="h-4 w-4" /> },
    { id: 'features', name: 'Features & Tools', icon: <Settings className="h-4 w-4" /> },
    { id: 'billing', name: 'Billing & Pricing', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'technical', name: 'Technical Support', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'account', name: 'Account Management', icon: <Users className="h-4 w-4" /> }
  ];

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: "How do I get started with NusantaraX?",
      answer: "Getting started is simple! Sign up for a free account, verify your email, and you'll have immediate access to our 14-day free trial. No credit card required. Our onboarding wizard will guide you through setting up your first AI assistant, generating your first image, and exploring all features.",
      popular: true
    },
    {
      id: 2,
      category: 'getting-started',
      question: "What is included in the free trial?",
      answer: "Our 14-day free trial includes full access to all Professional plan features: Advanced AI Assistant, 250 image generations, 250 caption generations, advanced analytics, priority support, and template library. You can explore everything without any limitations during the trial period.",
      popular: true
    },
    {
      id: 3,
      category: 'features',
      question: "How does the AI Assistant work?",
      answer: "Our AI Assistant uses advanced natural language processing powered by OpenAI and Claude models. It can handle customer inquiries, provide product information, assist with digital marketing strategies, and automate customer support. You can customize its personality, knowledge base, and responses to match your brand voice.",
      popular: false
    },
    {
      id: 4,
      category: 'features',
      question: "Can I customize the AI-generated images?",
      answer: "Absolutely! Our Image Generator offers both template-based and custom generation. You can modify colors, add your logo, change text, adjust layouts, and apply brand guidelines. For advanced users, we provide API access for programmatic image generation and bulk operations.",
      popular: false
    },
    {
      id: 5,
      category: 'features',
      question: "What languages does the Caption Generator support?",
      answer: "Our Caption Generator supports Bahasa Indonesia, English, and other major languages. It can create content optimized for different social media platforms (Instagram, Facebook, TikTok, LinkedIn) and includes hashtag recommendations, trend analysis, and engagement optimization.",
      popular: false
    },
    {
      id: 6,
      category: 'billing',
      question: "How does billing work?",
      answer: "We offer flexible monthly and yearly billing options. You can upgrade, downgrade, or cancel anytime. Yearly plans come with significant discounts (up to 17% savings). We accept credit cards, bank transfers, and local Indonesian payment methods including GoPay, OVO, and DANA.",
      popular: true
    },
    {
      id: 7,
      category: 'billing',
      question: "Do you offer refunds?",
      answer: "Yes! We offer a 30-day money-back guarantee for all paid plans. If you're not completely satisfied within the first 30 days, contact our support team for a full refund. The refund process typically takes 3-5 business days.",
      popular: false
    },
    {
      id: 8,
      category: 'billing',
      question: "What happens when I exceed my monthly limits?",
      answer: "When you approach your monthly limits, you'll receive notifications. Once exceeded, you can either upgrade your plan for immediate access or wait until the next billing cycle. Enterprise customers have unlimited usage across all features.",
      popular: false
    },
    {
      id: 9,
      category: 'technical',
      question: "Is my data secure with NusantaraX?",
      answer: "Security is our top priority. We use enterprise-grade encryption (AES-256), secure data centers, regular security audits, and comply with international data protection standards. Your data is never shared with third parties and you maintain full ownership of all generated content.",
      popular: true
    },
    {
      id: 10,
      category: 'technical',
      question: "Do you provide API access?",
      answer: "Yes! Professional and Enterprise plans include API access. Our RESTful API allows you to integrate NusantaraX features into your existing systems, automate workflows, and build custom applications. Complete documentation and SDKs are available for developers.",
      popular: false
    },
    {
      id: 11,
      category: 'technical',
      question: "What are your uptime guarantees?",
      answer: "We maintain 99.9% uptime with robust infrastructure across multiple data centers. Our system includes automatic failover, real-time monitoring, and 24/7 technical support. Enterprise customers receive priority support with guaranteed response times.",
      popular: false
    },
    {
      id: 12,
      category: 'account',
      question: "Can I add team members to my account?",
      answer: "Yes! Professional plans support up to 5 team members, while Enterprise plans offer unlimited users. You can manage permissions, assign roles, track individual usage, and collaborate on projects. Team billing is consolidated under one account.",
      popular: false
    },
    {
      id: 13,
      category: 'account',
      question: "How do I export my data?",
      answer: "You can export your data anytime through the dashboard. Basic plans include CSV exports, Professional plans add Excel support, and Enterprise plans provide API access for automated exports. We also offer assisted migration services for large datasets.",
      popular: false
    },
    {
      id: 14,
      category: 'account',
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time through your account settings. There are no cancellation fees or penalties. Your access will continue until the end of your current billing period, and you can reactivate anytime.",
      popular: false
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularFaqs = faqs.filter(faq => faq.popular);

  const supportOptions = [
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Mail className="h-8 w-8" />,
      title: "Email Support",
      description: "Send us detailed questions via email",
      action: "Send Email",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: <Phone className="h-8 w-8" />,
      title: "Phone Support",
      description: "Speak directly with our experts",
      action: "Call Now",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <AdvancedNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-white">Frequently Asked</span>{' '}
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Find answers to common questions about NusantaraX platform, features, and services.
              Can't find what you're looking for? Contact our support team.
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 bg-gray-900/50 border-gray-700 focus:border-[#72c306] text-white text-lg rounded-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] text-black font-semibold'
                      : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:border-[#72c306]/30 hover:text-[#72c306]'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* FAQ List */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence>
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="mb-4"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full p-6 bg-gray-900/50 border border-gray-800 rounded-2xl text-left hover:border-[#72c306]/30 transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white group-hover:text-[#72c306] transition-colors">
                            {faq.question}
                          </h3>
                          {faq.popular && (
                            <span className="px-2 py-1 bg-[#72c306]/20 text-[#72c306] text-xs font-bold rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {categories.find(cat => cat.id === faq.category)?.name}
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="h-5 w-5 text-[#72c306]" />
                      </motion.div>
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedFaq === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-gray-300 leading-relaxed bg-gray-900/30 mx-6 rounded-b-xl border-t border-gray-800">
                          <div className="pt-6">
                            {faq.answer}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredFaqs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <HelpCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  No questions found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search terms or browse different categories
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Support Options */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="text-white">Still Need</span>{' '}
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                Help?
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our support team is always ready to assist you with any questions or concerns
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {supportOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <div className="p-8 bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-3xl border border-gray-700/50 hover:border-[#72c306]/30 transition-all duration-300 text-center">
                  <motion.div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${option.color}/20 border border-gray-600 mb-6`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <div className={`text-transparent bg-gradient-to-r ${option.color} bg-clip-text`}>
                      {option.icon}
                    </div>
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#72c306] transition-colors">
                    {option.title}
                  </h3>
                  
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {option.description}
                  </p>
                  
                  <Button
                    className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white font-semibold rounded-xl"
                    asChild
                  >
                    <Link href="/contact">
                      {option.action}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-8">
              <span className="text-white">Additional</span>{' '}
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                Resources
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <Book className="h-8 w-8" />,
                title: "Documentation",
                description: "Comprehensive guides and tutorials",
                link: "/docs"
              },
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: "API Reference",
                description: "Developer documentation and examples",
                link: "/api-docs"
              },
              {
                icon: <Download className="h-8 w-8" />,
                title: "Resource Downloads",
                description: "Templates, guides, and tools",
                link: "/resources"
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Community Forum",
                description: "Connect with other users and share tips",
                link: "/community"
              }
            ].map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link href={resource.link} className="block p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-[#72c306]/30 transition-all duration-300 text-center">
                  <motion.div
                    className="inline-flex p-3 rounded-xl bg-[#72c306]/20 border border-[#72c306]/30 mb-4"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="text-[#72c306]">
                      {resource.icon}
                    </div>
                  </motion.div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#72c306] transition-colors">
                    {resource.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm">
                    {resource.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="p-12 bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 rounded-3xl border border-[#72c306]/30 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/10"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="text-white">Ready to Transform</span>{' '}
                  <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                    Your Business?
                  </span>
                </h2>
                
                <p className="text-xl text-gray-300 mb-8">
                  Start your free trial today and discover how NusantaraX can revolutionize your SME
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white rounded-xl shadow-lg shadow-[#72c306]/30"
                    asChild
                  >
                    <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold border-2 border-[#72c306]/30 text-[#72c306] hover:bg-[#72c306]/10 rounded-xl"
                    asChild
                  >
                    <Link href="/contact">
                      Contact Sales
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;