'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Image as ImageIcon,
  MessageSquare,
  BarChart3,
  Wallet,
  CheckCircle2,
  Star,
  ArrowRight,
  TrendingUp,
  Users,
  Zap,
  Globe as GlobeIcon,
  PlayCircle,
  Target,
  Sparkles,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Clock,
  Quote,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Globe } from '@/components/ui/globe';
import { ShineBorder } from '@/components/ui/shine-border';
import AdvancedNavbar from '@/components/layout/AdvancedNavbar';
import FloatingMascot from '@/components/ui/FloatingMascot';

const AdvancedLandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeHeroImage, setActiveHeroImage] = useState(0);
  const [activePricingCard, setActivePricingCard] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const services = [
    {
      icon: <Bot className="h-12 w-12" />,
      title: "AI Assistant",
      description: "AI assistant for you to help answer anything about digital marketing strategies and optimization",
      features: ["Natural Language Processing", "Multi-platform Integration", "Analytics Dashboard"],
      gradient: "from-blue-500 to-cyan-500",
      delay: 0.1
    },
    {
      icon: <ImageIcon className="h-12 w-12" />,
      title: "Image Generator",
      description: "Create engaging visual content for social media and marketing with cutting-edge AI technology",
      features: ["Template Library", "Brand Consistency", "High Resolution Output"],
      gradient: "from-purple-500 to-pink-500",
      delay: 0.2
    },
    {
      icon: <MessageSquare className="h-12 w-12" />,
      title: "Caption Generator",
      description: "Generate engaging social media captions that resonate with your target audience",
      features: ["Trend Analysis", "Hashtag Optimization", "Multi-language Support"],
      gradient: "from-green-500 to-teal-500",
      delay: 0.3
    },
    {
      icon: <BarChart3 className="h-12 w-12" />,
      title: "Business Analytics",
      description: "Comprehensive dashboard to monitor business performance and optimize marketing strategy",
      features: ["Real-time Monitoring", "ROI Tracking", "Custom Reports"],
      gradient: "from-orange-500 to-red-500",
      delay: 0.4
    }
  ];

  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80",
      title: "Business Analytics Dashboard",
      description: "Real-time insights for your business"
    },
    {
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "AI-Powered Solutions",
      description: "Cutting-edge technology at your fingertips"
    },
    {
      url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Team Collaboration",
      description: "Work together seamlessly across your organization"
    },
    {
      url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Digital Marketing Tools",
      description: "Automate and optimize your marketing campaigns"
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "Rp15k",
      period: "/month",
      description: "Perfect for SMEs just starting their digital transformation",
      features: [
        "AI Assistant",
        "1500 Image Generation / month",
        "1500 Captions / month",
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

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Owner Local Food Hub",
      image: "/api/placeholder/60/60",
      content: "NusantaraX helped my restaurant get more customers through social media. The AI Assistant is incredibly helpful for answering customer questions!",
      rating: 5,
      location: "Jakarta"
    },
    {
      name: "Michael Chen",
      role: "Founder Heritage Crafts",
      image: "/api/placeholder/60/60",
      content: "The Image Generator is amazing! Now I can create professional visual content without hiring a designer. The ROI is incredibly high.",
      rating: 5,
      location: "Yogyakarta"
    },
    {
      name: "Lisa Wong",
      role: "CEO Beauty Care Indonesia",
      image: "/api/placeholder/60/60",
      content: "The analytics dashboard helped me understand customer behavior. Online sales increased 300% within 6 months of using NusantaraX.",
      rating: 5,
      location: "Surabaya"
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

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    const heroImageInterval = setInterval(() => {
      setActiveHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    const pricingCardInterval = setInterval(() => {
      setActivePricingCard((prev) => (prev + 1) % pricingPlans.length);
    }, 8000);
    
    return () => {
      clearInterval(testimonialInterval);
      clearInterval(heroImageInterval);
      clearInterval(pricingCardInterval);
    };
  }, []);

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
        <motion.div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl"
          animate={{ 
            x: [0, 100, -100, 0],
            y: [0, -50, 50, 0],
            scale: [1, 1.5, 0.8, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 lg:pt-20 pb-2 lg:pb-12">
        <motion.div
          className="container mx-auto px-4 sm:px-6 relative z-10"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-16 items-center max-w-7xl mx-auto"
          >
            {/* Globe - Shows first on mobile, second on desktop */}
            <motion.div
              variants={fadeInUp}
              className="order-1 lg:order-2 flex justify-center lg:justify-end -mt-4 lg:-mt-4"
            >
              <div className="relative w-[300px] h-[300px] lg:w-[700px] lg:h-[700px] lg:ml-8">
                <Globe
                  className=""
                  config={{
                    width: 400,
                    height: 400,
                    ...(typeof window !== 'undefined' && window.innerWidth >= 1024 ? { width: 800, height: 800 } : {}),
                    onRender: () => {},
                    devicePixelRatio: 2,
                    phi: 0,
                    theta: 0.3,
                    dark: 1,
                    diffuse: 0.4,
                    mapSamples: 16000,
                    mapBrightness: 1.2,
                    baseColor: [0.3, 0.3, 0.3],
                    markerColor: [114 / 255, 195 / 255, 6 / 255],
                    glowColor: [114 / 255, 195 / 255, 6 / 255],
                    markers: [
                      { location: [-6.2, 106.816], size: 0.1 }, // Jakarta, Indonesia
                      { location: [-7.797, 110.370], size: 0.08 }, // Yogyakarta, Indonesia
                      { location: [-7.257, 112.752], size: 0.08 }, // Surabaya, Indonesia
                      { location: [3.597, 98.678], size: 0.06 }, // Medan, Indonesia
                      { location: [-5.135, 119.423], size: 0.07 }, // Makassar, Indonesia
                      { location: [1.290, 103.851], size: 0.08 }, // Singapore
                      { location: [3.139, 101.687], size: 0.07 }, // Kuala Lumpur, Malaysia
                      { location: [14.599, 120.984], size: 0.06 }, // Manila, Philippines
                      { location: [13.756, 100.501], size: 0.07 }, // Bangkok, Thailand
                      { location: [10.823, 106.629], size: 0.06 }, // Ho Chi Minh City, Vietnam
                      { location: [21.028, 105.804], size: 0.05 }, // Hanoi, Vietnam
                      { location: [22.396, 114.109], size: 0.08 }, // Hong Kong
                      { location: [35.676, 139.650], size: 0.09 }, // Tokyo, Japan
                      { location: [37.532, 127.024], size: 0.07 }, // Seoul, South Korea
                      { location: [39.904, 116.407], size: 0.1 }, // Beijing, China
                      { location: [31.230, 121.474], size: 0.09 }, // Shanghai, China
                    ],
                  }}
                />
              </div>
            </motion.div>

            {/* Text Content - Shows second on mobile, first on desktop */}
            <div className="order-2 lg:order-1 text-center lg:text-left lg:-mt-24 overflow-visible">
              {/* Main Heading */}
              <motion.div
                variants={fadeInUp}
                className="mb-4 lg:mb-6 text-center lg:text-left overflow-visible"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight overflow-visible w-full min-w-fit">
                  <div className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent overflow-visible whitespace-nowrap min-w-fit">
                    Digital Revolution
                  </div>
                  <div className="whitespace-nowrap overflow-visible">
                    <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">for </span><span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">Indonesian SMEs</span>
                  </div>
                </h1>
              </motion.div>

              <motion.p
                variants={fadeInUp}
                className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-6 lg:mb-8 leading-relaxed text-center lg:text-left"
              >
                Leading SaaS platform with{' '}
                <span className="text-[#72c306] font-semibold">AI Agents & Automation</span>{' '}
                to boost sales and business efficiency for SMEs
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 justify-center lg:justify-start"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-semibold bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white rounded-2xl shadow-lg shadow-[#72c306]/25 border-0"
                    asChild
                  >
                    <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                      <span className="flex items-center justify-center">
                        Get Started
                      </span>
                    </Link>
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto hidden sm:block"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-semibold bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white rounded-2xl shadow-lg shadow-[#72c306]/25 border-0"
                    asChild
                  >
                    <Link href="/documentation">
                      <span className="flex items-center justify-center">
                        <BookOpen className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                        Documentation
                      </span>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

            </div>
          </motion.div>

          {/* Tech Partners Marquee */}
          <motion.div
            variants={fadeInUp}
            className="mt-2 lg:-mt-20"
          >
            <div className="relative overflow-hidden py-4 lg:py-8">
              <motion.div
                className="flex space-x-20 items-center"
                animate={{ x: [0, -1600] }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {/* Tech Company Logos */}
                <div className="flex space-x-20 items-center whitespace-nowrap">
                  <motion.img
                    src="https://www.svgrepo.com/show/306500/openai.svg"
                    alt="OpenAI"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(1.3) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/claude-color.png"
                    alt="Anthropic Claude"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/303108/google-icon-logo.svg"
                    alt="Google"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/353805/google-cloud.svg"
                    alt="Google Cloud"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448266/aws.svg"
                    alt="AWS"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448218/digital-ocean.svg"
                    alt="Digital Ocean"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448221/docker.svg"
                    alt="Docker"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448226/gitlab.svg"
                    alt="GitLab"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448225/github.svg"
                    alt="GitHub"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(1.3) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448278/cisco.svg"
                    alt="Cisco"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448274/azure.svg"
                    alt="Microsoft Azure"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  
                  {/* Duplicate set for seamless loop */}
                  <motion.img
                    src="https://www.svgrepo.com/show/306500/openai.svg"
                    alt="OpenAI"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(1.3) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/claude-color.png"
                    alt="Anthropic Claude"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/303108/google-icon-logo.svg"
                    alt="Google"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/353805/google-cloud.svg"
                    alt="Google Cloud"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448266/aws.svg"
                    alt="AWS"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448218/digital-ocean.svg"
                    alt="Digital Ocean"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448221/docker.svg"
                    alt="Docker"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448226/gitlab.svg"
                    alt="GitLab"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448225/github.svg"
                    alt="GitHub"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(1.3) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448278/cisco.svg"
                    alt="Cisco"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                  <motion.img
                    src="https://www.svgrepo.com/show/448274/azure.svg"
                    alt="Microsoft Azure"
                    className="h-12 sm:h-16 lg:h-20 w-auto opacity-70 hover:opacity-90 transition-opacity duration-300" style={{ filter: 'brightness(0.7) contrast(0.7) grayscale(1)' }}
                    whileHover={{ scale: 1.15 }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-2 lg:py-16 pb-4 lg:pb-8 relative">
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
                  About NusantaraX
                </motion.div>
                
                <h2 className="text-5xl font-bold mb-8 leading-tight">
                  <span className="text-white">Empowering</span>{' '}
                  <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                    10,000+ SMEs
                  </span>{' '}
                  <span className="text-white">Across Indonesia</span>
                </h2>
                
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  NusantaraX provides a complete digitalization solution for Indonesian SMEs.
                  With cutting-edge AI technology, we help small and medium businesses
                  compete in the digital era and increase revenue by up to 300%.
                </p>

              </div>

              <motion.div
                className="relative"
                whileInView={{ scale: [0.8, 1] }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative w-full h-96 bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 rounded-3xl overflow-hidden">
                  <motion.div
                    className="absolute inset-4 bg-black rounded-2xl border border-[#72c306]/30 overflow-hidden"
                    animate={{ boxShadow: ["0 0 20px rgba(114, 195, 6, 0.3)", "0 0 40px rgba(114, 195, 6, 0.5)", "0 0 20px rgba(114, 195, 6, 0.3)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/KXKinQd1Gf8?si=nmdqQgL6obyj1szq"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="rounded-xl"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features/Services Section */}
      <section id="features" className="py-16 pt-8 pb-8 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-[#72c306]/10 border border-[#72c306]/20 rounded-full text-sm font-medium text-[#72c306]">
              <Zap className="h-4 w-4 mr-2" />
              Featured Services
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="text-white">Most Complete AI Solution for</span>{' '}
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                Digital Marketing
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              All-in-one platform with cutting-edge AI technology to automate
              and optimize every aspect of your business digital marketing
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: service.delay }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative"
              >
                <div className="p-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-3xl border border-gray-700/50 backdrop-blur-sm hover:border-[#72c306]/30 transition-all duration-500 relative overflow-hidden">
                  {/* Background Gradient Effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    whileHover={{ scale: 1.1 }}
                  />
                  
                  <div className="relative z-10">
                    <motion.div
                      className="inline-flex p-4 rounded-2xl bg-[#72c306]/20 border border-[#72c306]/30 mb-6"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <div className="text-[#72c306]">
                        {service.icon}
                      </div>
                    </motion.div>
                    
                    <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-[#72c306] transition-colors duration-300">
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * featureIndex }}
                        >
                          <CheckCircle2 className="h-5 w-5 text-[#72c306] mr-3 flex-shrink-0" />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                    
                    <Button
                      className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white font-semibold py-3 rounded-xl transition-all duration-300"
                      asChild
                    >
                      <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                        Try Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Carousel Section */}
      <section className="py-16 pt-8 pb-8 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-[#72c306]/10 border border-[#72c306]/20 rounded-full text-sm font-medium text-[#72c306]">
              <Sparkles className="h-4 w-4 mr-2" />
              Digital Solutions in Action
            </div>
            
            <h2 className="text-5xl font-bold mb-8">
              <span className="text-white">See Our</span>{' '}
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                AI Technology
              </span>{' '}
              <span className="text-white">in Action</span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover how our cutting-edge AI solutions transform business operations
              and drive digital growth for Indonesian SMEs
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <div className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeHeroImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden">
                    {/* Left Shadow */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                    {/* Right Shadow */}
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
                    
                    <img
                      src={heroImages[activeHeroImage].url}
                      alt={heroImages[activeHeroImage].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 z-20">
                      <motion.h3
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl md:text-4xl font-bold text-white mb-4"
                      >
                        {heroImages[activeHeroImage].title}
                      </motion.h3>
                      <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-gray-200 text-lg md:text-xl"
                      >
                        {heroImages[activeHeroImage].description}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Image Indicators */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveHeroImage(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === activeHeroImage
                        ? 'bg-[#72c306] scale-125'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 pt-8 pb-8 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-[#72c306]/10 border border-[#72c306]/20 rounded-full text-sm font-medium text-[#72c306]">
              <Quote className="h-4 w-4 mr-2" />
              Customer Testimonials
            </div>
            
            <h2 className="text-5xl font-bold mb-8">
              <span className="text-white">Success Stories</span>{' '}
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                Indonesian SMEs
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of SMEs who have experienced digital transformation
              and increased sales with NusantaraX
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-3xl p-12 border border-gray-700/50 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#72c306]/5 to-[#8fd428]/5"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-6 w-6 text-[#72c306] fill-current" />
                      ))}
                    </div>
                    
                    <blockquote className="text-2xl text-gray-200 mb-8 leading-relaxed italic">
                      "{testimonials[activeTestimonial].content}"
                    </blockquote>
                    
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-full flex items-center justify-center text-black font-bold text-xl">
                        {testimonials[activeTestimonial].name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className="text-xl font-semibold text-white">
                          {testimonials[activeTestimonial].name}
                        </div>
                        <div className="text-[#72c306] font-medium">
                          {testimonials[activeTestimonial].role}
                        </div>
                        <div className="text-sm text-gray-400">
                          {testimonials[activeTestimonial].location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Indicators */}
            <div className="flex justify-center space-x-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial 
                      ? 'bg-[#72c306] scale-125' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 pt-8 pb-8 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-[#72c306]/10 border border-[#72c306]/20 rounded-full text-sm font-medium text-[#72c306]">
              <TrendingUp className="h-4 w-4 mr-2" />
              Subscription Plans
            </div>
            
            <h2 className="text-5xl font-bold mb-8">
              <span className="text-white">Choose the Right Plan</span>{' '}
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                for Your Business
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Start with a free plan, upgrade anytime. All plans come with
              24/7 support and 30-day money-back guarantee
            </p>
          </motion.div>

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

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mt-16"
          >
            <p className="text-gray-400 mb-4">
              Need a custom plan for large enterprises?
            </p>
            <Button
              className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25"
              asChild
            >
              <Link href="#contact">
                Contact Sales Team
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 pt-8 pb-8 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-[#72c306]/10 border border-[#72c306]/20 rounded-full text-sm font-medium text-[#72c306]">
              <Quote className="h-4 w-4 mr-2" />
              Frequently Asked Questions
            </div>
            
            <h2 className="text-5xl font-bold mb-8">
              <span className="text-white">Got Questions?</span>{' '}
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                We Have Answers
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Find answers to the most common questions about NusantaraX platform and services
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: "What is NusantaraX and how does it help SMEs?",
                answer: "NusantaraX is a comprehensive SaaS platform designed specifically for Indonesian SMEs. We provide AI-powered tools including chatbots, image generators, caption creators, and analytics to help businesses automate their digital marketing and increase sales by up to 300%."
              },
              {
                question: "Is there a free trial available?",
                answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required to start. You can explore all our AI tools and see how they can transform your business before committing to a paid plan."
              },
              {
                question: "What services are included in the platform?",
                answer: "Our platform includes AI Assistant for customer service automation, Image Generator for visual content creation, Caption Generator for social media content, Business Analytics dashboard, and integrated Wallet & Billing system for seamless payment management."
              },
              {
                question: "How secure is my business data?",
                answer: "We take security seriously. NusantaraX uses enterprise-grade encryption to protect your data. All information is stored securely and we comply with international data protection standards."
              },
              {
                question: "Can I upgrade or downgrade my plan anytime?",
                answer: "Absolutely! You can change your subscription plan at any time. Upgrades take effect immediately, and downgrades will take effect at the end of your current billing cycle. We also offer a 30-day money-back guarantee."
              },
              {
                question: "Do you provide customer support?",
                answer: "Yes, we provide 24/7 customer support via email, chat, and WhatsApp. Professional and Enterprise plans also include priority support and dedicated account managers to ensure your success."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-[#72c306]/30 transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6 relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#72c306]/5 to-[#8fd428]/5 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-[#72c306] transition-colors duration-300">
                      {faq.question}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mt-16"
          >
            <p className="text-gray-400 mb-4">
              Still have questions? We're here to help!
            </p>
            <Button
              className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25"
              asChild
            >
              <Link href="#contact">
                Contact Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 pt-8 pb-8 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-[#72c306]/10 border border-[#72c306]/20 rounded-full text-sm font-medium text-[#72c306]">
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </div>
            
            <h2 className="text-5xl font-bold mb-8">
              <span className="text-white">Ready to Start Your</span>{' '}
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                Digital Transformation?
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our expert team is ready to help you design the right digital marketing
              strategy for your SME business
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-3xl font-bold text-white mb-8 text-center">Let's Collaborate</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/5 rounded-xl border border-[#72c306]/20">
                  <Mail className="h-6 w-6 text-[#72c306] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Email</h4>
                    <p className="text-gray-300">support@nusantarax.web.id</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/5 rounded-xl border border-[#72c306]/20">
                  <Phone className="h-6 w-6 text-[#72c306] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">WhatsApp</h4>
                    <p className="text-gray-300">+62 896 4314 3750</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/5 rounded-xl border border-[#72c306]/20">
                  <MapPin className="h-6 w-6 text-[#72c306] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Address</h4>
                    <p className="text-gray-300">
                      Jl. Cokonuri Raya Gunung Sari, Rappocini<br />
                      Makassar City, South Sulawesi
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/5 rounded-xl border border-[#72c306]/20">
                  <Clock className="h-6 w-6 text-[#72c306] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Business Hours</h4>
                    <p className="text-gray-300">
                      Monday - Friday: 09:00 - 18:00 WIB<br />
                      Saturday: 09:00 - 15:00 WIB
                    </p>
                  </div>
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
                  <GlobeIcon className="h-5 w-5" />
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

export default AdvancedLandingPage;