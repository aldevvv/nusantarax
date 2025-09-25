'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Users,
  Target,
  TrendingUp,
  Award,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Heart,
  Lightbulb,
  Zap,
  Shield,
  Rocket,
  Building,
  Map,
  Calendar,
  Phone,
  Mail,
  Trophy,
  ChevronRight,
  Bot,
  Image as ImageIcon,
  MessageSquare,
  BarChart3,
  Instagram,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvancedNavbar from '@/components/layout/AdvancedNavbar';
import FloatingMascot from '@/components/ui/FloatingMascot';
import { useAuth } from '@/hooks/useAuth';

const AboutPage = () => {
  const { isAuthenticated } = useAuth();
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const stats = [
    {
      number: "10,000+",
      label: "Registered SMEs",
      description: "Have joined and experienced digital transformation"
    },
    {
      number: "300%",
      label: "Revenue Increase",
      description: "Average sales growth for clients within 6 months"
    },
    {
      number: "99.9%",
      label: "Platform Uptime",
      description: "Reliable system that can be trusted 24/7"
    },
    {
      number: "150+",
      label: "Cities in Indonesia",
      description: "Service coverage across the archipelago"
    }
  ];

  const milestones = [
    {
      year: "Phase 1",
      title: "Problem Analysis",
      description: "Deep research into Indonesian SME challenges in digital adoption, market barriers, and technology gaps to understand core pain points",
      icon: <Target className="h-6 w-6" />
    },
    {
      year: "Phase 2",
      title: "Ideation & Concept",
      description: "Developing the vision for an AI-powered platform that could democratize digital tools for Indonesian small and medium enterprises",
      icon: <Lightbulb className="h-6 w-6" />
    },
    {
      year: "Phase 3",
      title: "Research & Development",
      description: "Building the core AI technologies, designing user interfaces, and creating scalable infrastructure for nationwide SME support",
      icon: <Bot className="h-6 w-6" />
    },
    {
      year: "Phase 4",
      title: "Testing & Validation",
      description: "Pilot programs with selected SMEs, gathering feedback, refining features, and validating our solution effectiveness",
      icon: <CheckCircle2 className="h-6 w-6" />
    },
    {
      year: "Phase 5",
      title: "Official Launch",
      description: "Full platform launch with complete AI suite - empowering thousands of Indonesian SMEs to transform their businesses digitally",
      icon: <Rocket className="h-6 w-6" />
    }
  ];

  const teamMembers = [
    {
      name: "Muh Alif",
      role: "CEO & Web Developer",
      image: "https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/Alif.jpg",
      description: "Visionary leader and full-stack developer, passionate about empowering Indonesian SMEs through innovative technology solutions",
      socials: {
        instagram: "https://www.instagram.com/mhdalif.id/",
        linkedin: "https://www.linkedin.com/in/mhdalif-id/",
        website: "/"
      }
    },
    {
      name: "Muh Syarif",
      role: "Creative & UI/UX Designer",
      image: "https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/Syarif.jpg",
      description: "Creative mastermind focused on crafting beautiful and intuitive user experiences that drive SME success",
      socials: {
        instagram: "https://www.instagram.com/syariffrahmann/",
        linkedin: "https://www.linkedin.com/in/muhammadsyarif2312/",
        website: "/"
      }
    },
    {
      name: "Muh Fathir",
      role: "Marketing & Business Analyst",
      image: "https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/Fathir.jpg",
      description: "Data-driven marketing strategist with deep understanding of Indonesian SME market dynamics and growth opportunities",
      socials: {
        instagram: "https://www.instagram.com/fatirranugrah/",
        linkedin: "https://www.linkedin.com/in/fathiranugrah/",
        website: "/"
      }
    },
    {
      name: "Muh Asrul",
      role: "Head of AI Engineering",
      image: "https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/Asrul.jpg",
      description: "AI/ML expert leading the development of cutting-edge artificial intelligence solutions that power our platform",
      socials: {
        instagram: "https://www.instagram.com/mharhl/",
        linkedin: "https://www.linkedin.com/in/muhasrul/",
        website: "/"
      }
    }
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "SME First",
      description: "Every decision we make prioritizes the interests and success of Indonesian small and medium enterprises",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Trust & Security",
      description: "Building trust through enterprise-level data security and complete transparency in all our operations",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Innovation",
      description: "Continuously innovating with cutting-edge technology to provide the best solutions for SMEs",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Driven",
      description: "Building an SME ecosystem that supports each other and grows together in the digital era",
      color: "from-green-500 to-teal-500"
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <AdvancedNavbar />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-[#72c306]/10 rounded-full blur-3xl"
          style={{ y: backgroundY }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-80 h-80 bg-[#8fd428]/10 rounded-full blur-3xl"
          style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-100%']) }}
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Mission & Vision Section */}
      <section className="py-16 pt-24 pb-8 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <motion.div
                  className="inline-flex items-center px-4 py-2 mb-6 bg-[#72c306]/10 border border-[#72c306]/20 rounded-full text-sm font-medium text-[#72c306]"
                  whileInView={{ x: [0, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Our Mission & Vision
                </motion.div>
                
                <h2 className="text-5xl font-bold mb-8 leading-tight">
                  <span className="text-white">Democratizing</span>{' '}
                  <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                    Digital Technology
                  </span>{' '}
                  <span className="text-white">for All</span>
                </h2>
                
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/5 rounded-2xl border border-[#72c306]/20">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                      <Rocket className="h-6 w-6 text-[#72c306] mr-3" />
                      Our Mission
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Empowering every Indonesian SME with cutting-edge AI technology that is easily accessible,
                      affordable, and can enhance business competitiveness in the digital era.
                    </p>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/5 rounded-2xl border border-[#72c306]/20">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                      <Globe className="h-6 w-6 text-[#72c306] mr-3" />
                      Our Vision
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      To become the #1 SME digital transformation platform in Southeast Asia, creating
                      an inclusive and sustainable business ecosystem for everyone.
                    </p>
                  </div>
                </div>
              </div>

              <motion.div
                className="relative"
                whileInView={{ scale: [0.8, 1] }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative w-full h-[500px] bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 rounded-3xl overflow-hidden">
                  <motion.div
                    className="absolute inset-4 bg-black rounded-2xl border border-[#72c306]/30 overflow-hidden flex items-center justify-center"
                    animate={{ boxShadow: ["0 0 20px rgba(114, 195, 6, 0.3)", "0 0 40px rgba(114, 195, 6, 0.5)", "0 0 20px rgba(114, 195, 6, 0.3)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="grid grid-cols-2 gap-6 p-8">
                      <div className="p-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                        <Bot className="h-12 w-12 text-blue-400 mb-4" />
                        <div className="text-white font-semibold">AI Assistant</div>
                      </div>
                      <div className="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                        <ImageIcon className="h-12 w-12 text-purple-400 mb-4" />
                        <div className="text-white font-semibold">Image Generator</div>
                      </div>
                      <div className="p-6 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-xl border border-green-500/30">
                        <MessageSquare className="h-12 w-12 text-green-400 mb-4" />
                        <div className="text-white font-semibold">Caption Generator</div>
                      </div>
                      <div className="p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
                        <BarChart3 className="h-12 w-12 text-orange-400 mb-4" />
                        <div className="text-white font-semibold">Analytics</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-16 pt-8 pb-8 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-[#72c306]/10 border border-[#72c306]/20 rounded-full text-sm font-medium text-[#72c306]">
              <Award className="h-4 w-4 mr-2" />
              Our Values
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="text-white">Principles that</span>{' '}
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                Guide Our Steps
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative"
              >
                <div className="p-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-3xl border border-gray-700/50 backdrop-blur-sm hover:border-[#72c306]/30 transition-all duration-500 relative overflow-hidden">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />
                  
                  <div className="relative z-10">
                    <motion.div
                      className="inline-flex p-4 rounded-2xl bg-[#72c306]/20 border border-[#72c306]/30 mb-6"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <div className="text-[#72c306]">
                        {value.icon}
                      </div>
                    </motion.div>
                    
                    <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-[#72c306] transition-colors duration-300">
                      {value.title}
                    </h3>
                    
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey/Timeline */}
      <section className="py-16 pt-8 pb-8 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-[#72c306]/10 border border-[#72c306]/20 rounded-full text-sm font-medium text-[#72c306]">
              <Calendar className="h-4 w-4 mr-2" />
              Our Journey
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="text-white">From Idea to</span>{' '}
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                Market Leader
              </span>
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div className="inline-block px-4 py-2 bg-[#72c306]/20 text-[#72c306] rounded-full text-sm font-bold mb-4">
                    {milestone.year}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{milestone.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{milestone.description}</p>
                </div>
                
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-full flex items-center justify-center text-black"
                    whileHover={{ scale: 1.1 }}
                    animate={{ 
                      boxShadow: ["0 0 20px rgba(114, 195, 6, 0.3)", "0 0 30px rgba(114, 195, 6, 0.5)", "0 0 20px rgba(114, 195, 6, 0.3)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {milestone.icon}
                  </motion.div>
                  {index < milestones.length - 1 && (
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-[#72c306] to-transparent"></div>
                  )}
                </div>
                
                <div className="flex-1"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 pt-8 pb-8 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-[#72c306]/10 border border-[#72c306]/20 rounded-full text-sm font-medium text-[#72c306]">
              <Users className="h-4 w-4 mr-2" />
              Our Team
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="text-white">Meet the</span>{' '}
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                Visionaries
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Multidisciplinary team with global experience dedicated to delivering
              the best solutions for Indonesian SMEs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group h-full"
              >
                <div className="h-full p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-3xl border border-gray-700/50 backdrop-blur-sm hover:border-[#72c306]/30 transition-all duration-500 text-center flex flex-col">
                  <motion.div
                    className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-full p-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                  <div className="text-[#72c306] font-semibold mb-4">{member.role}</div>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed flex-grow">{member.description}</p>
                  
                  <div className="flex justify-center gap-4 mt-auto pt-4">
                    <motion.a
                      href={member.socials.instagram}
                      className="p-2 bg-gray-800/50 rounded-full text-gray-400 hover:text-pink-500 hover:bg-pink-500/10 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Instagram className="h-5 w-5" />
                    </motion.a>
                    <motion.a
                      href={member.socials.linkedin}
                      className="p-2 bg-gray-800/50 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Linkedin className="h-5 w-5" />
                    </motion.a>
                    <motion.a
                      href={member.socials.website}
                      className="p-2 bg-gray-800/50 rounded-full text-gray-400 hover:text-[#72c306] hover:bg-[#72c306]/10 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Globe className="h-5 w-5" />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 pt-8 pb-8 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="p-12 bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 rounded-3xl border border-[#72c306]/30 backdrop-blur-sm relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/10"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="text-white">Ready to Join the</span>{' '}
                  <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                    Digital Revolution?
                  </span>
                </h2>
                
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Join thousands of Indonesian SMEs who have experienced
                  digital transformation and sales growth up to 300%
                </p>
                
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white rounded-xl shadow-lg shadow-[#72c306]/30"
                    asChild
                  >
                    <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                      Start Free Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
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

export default AboutPage;