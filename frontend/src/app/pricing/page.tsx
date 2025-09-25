'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  TrendingUp,
  Globe,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShineBorder } from '@/components/ui/shine-border';
import AdvancedNavbar from '@/components/layout/AdvancedNavbar';
import FloatingMascot from '@/components/ui/FloatingMascot';

const PricingPage = () => {
  const { isAuthenticated } = useAuth();

  const pricingPlans = [
    {
      name: "Basic",
      price: "Rp15k",
      period: "/month",
      description: "Perfect for SMEs just starting their digital transformation",
      features: [
        "AI Assistant",
        "750 Image Generation / month",
        "750 Captions / month",
        "Basic Analytics",
        "Email Support"
      ],
      popular: false,
      cta: "Get Started",
      gradient: "from-gray-600 to-gray-700"
    },
    {
      name: "Pro",
      price: "Rp35k",
      period: "/month",
      description: "Complete solution for growing SMEs",
      features: [
        "AI Assistant Advanced",
        "2500 Image Generation / month",
        "2500 Captions / month",
        "Advanced Analytics",
        "Priority Support",
        "Custom Branding",
        "Access for New Features"
      ],
      popular: true,
      cta: "Choose This Plan",
      gradient: "from-[#72c306] to-[#8fd428]"
    },
    {
      name: "Enterprise",
      price: "Rp150k",
      period: "/month",
      description: "Custom solution for large enterprises and franchises",
      features: [
        "All Pro Plan Features",
        "Unlimited Image Generation",
        "Unlimited Captions",
        "Custom Features",
        "API Access",
        "White Label Solution",
        "24/7 Priority Support",
        "Custom Integration"
      ],
      popular: false,
      cta: "Contact Sales",
      gradient: "from-purple-600 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <AdvancedNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-8">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              className="inline-flex items-center px-6 py-3 mb-8 bg-[#72c306]/10 border border-[#72c306]/20 rounded-full text-sm font-medium text-[#72c306]"
              whileHover={{ scale: 1.05 }}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Transparent Pricing
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-white">Choose the Perfect Plan</span>{' '}
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                for Your Business
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Start free, scale as you grow. All plans include our core AI features
              with 24/7 support and a 30-day money-back guarantee
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 pt-8 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -10 }}
                className={`relative ${plan.popular ? 'z-10' : ''} flex`}
              >
                {plan.popular && (
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white text-sm font-bold rounded-full"
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ⭐ Most Popular
                  </motion.div>
                )}
                
                <div className={`w-full p-8 rounded-3xl border transition-all duration-500 relative overflow-hidden flex flex-col ${
                  plan.popular
                    ? 'bg-gradient-to-b from-[#72c306]/10 to-[#8fd428]/5 border-[#72c306]/30 shadow-2xl shadow-[#72c306]/20'
                    : 'bg-black border-gray-700/50'
                }`}>
                  {!plan.popular && (
                    <ShineBorder
                      shineColor={["#72c306", "#8fd428", "#72c306"]}
                      borderWidth={1}
                      duration={6}
                      className="absolute inset-0 rounded-3xl"
                    />
                  )}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} opacity-5`}
                    whileHover={{ opacity: 0.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                    
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-gray-400 ml-2">{plan.period}</span>
                    </div>
                    
                    <p className="text-gray-300 mb-8">{plan.description}</p>
                    
                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-300">
                          <CheckCircle2 className="h-5 w-5 text-[#72c306] mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      className="w-full py-4 rounded-xl font-semibold transition-all duration-300 mt-auto bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25"
                      asChild
                    >
                      <Link href={isAuthenticated ? "/dashboard/billing" : "/register"}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
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

export default PricingPage;