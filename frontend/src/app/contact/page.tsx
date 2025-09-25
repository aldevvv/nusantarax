'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  Headphones,
  Globe,
  ArrowRight,
  Building,
  Users,
  Calendar,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdvancedNavbar from '@/components/layout/AdvancedNavbar';

const ContactPage = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Us",
      primary: "support@nusantarax.web.id",
      secondary: "sales@nusantarax.web.id",
      description: "Get in touch for general inquiries or sales questions",
      action: "Send Email"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Call Us",
      primary: "+6289643143750",
      secondary: "WhatsApp Available",
      description: "Speak directly with our team for immediate assistance",
      action: "Call Now"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Visit Us",
      primary: "Jl. Cokonuri Raya Dalam 1",
      secondary: "Rappocini, Makassar City, South Sulawesi",
      description: "Our headquarters in the heart of Makassar",
      action: "Get Directions"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Business Hours",
      primary: "07.00 - 22.00",
      secondary: "Available Daily",
      description: "We're here when you need us most",
      action: "Schedule Meeting"
    }
  ];

  const inquiryTypes = [
    { value: "general", label: "General Inquiry" },
    { value: "sales", label: "Sales & Pricing" },
    { value: "support", label: "Technical Support" },
    { value: "partnership", label: "Partnership" },
    { value: "demo", label: "Request Demo" },
    { value: "other", label: "Other" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        inquiryType: ''
      });
    }, 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
              <MessageSquare className="h-4 w-4 text-[#72c306]" />
              <span className="text-[#72c306] text-sm font-medium">Get in Touch</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            >
              <span className="text-white">Let's Build Something</span>
              <br />
              <span className="bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                Amazing Together
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Ready to transform your business with AI? Our team is here to help you succeed.
              Reach out today and let's discuss your vision.
            </motion.p>

            {/* Contact Cards Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
            >
              {/* Email Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="p-6 bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-[#72c306]/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-[#72c306] mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  <Mail className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-white mb-2 group-hover:text-[#72c306] transition-colors">
                    Email Us
                  </div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                    support@nusantarax.web.id
                  </div>
                </div>
              </motion.div>

              {/* Call Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="p-6 bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-[#72c306]/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-[#72c306] mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  <Phone className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-white mb-2 group-hover:text-[#72c306] transition-colors">
                    Call Us
                  </div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                    +6289643143750
                  </div>
                </div>
              </motion.div>

              {/* Visit Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="p-6 bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-[#72c306]/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-[#72c306] mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  <MapPin className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-white mb-2 group-hover:text-[#72c306] transition-colors">
                    Visit Us
                  </div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                    Jl. Cokonuri Raya Dalam 1
                  </div>
                </div>
              </motion.div>

              {/* Business Hours Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="p-6 bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:border-[#72c306]/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-[#72c306] mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  <Clock className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-white mb-2 group-hover:text-[#72c306] transition-colors">
                    Business Hours
                  </div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                    07.00 - 22.00
                  </div>
                </div>
              </motion.div>
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
      
      {/* Contact Form & Map */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto items-start">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="p-8 bg-black rounded-3xl border border-gray-700/50">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Send us a Message
                  </h2>
                  <p className="text-gray-300">
                    Fill out the form below and we'll get back to you within 24 hours
                  </p>
                </div>

                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="bg-gray-800/50 border-gray-600 focus:border-[#72c306] text-white"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="bg-gray-800/50 border-gray-600 focus:border-[#72c306] text-white"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="bg-gray-800/50 border-gray-600 focus:border-[#72c306] text-white"
                          placeholder="+62 xxx xxx xxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Company Name
                        </label>
                        <Input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="bg-gray-800/50 border-gray-600 focus:border-[#72c306] text-white"
                          placeholder="Your company"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Inquiry Type *
                      </label>
                      <Select onValueChange={(value) => handleInputChange('inquiryType', value)}>
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-[#72c306] text-white">
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {inquiryTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="text-white hover:bg-[#72c306]/10">
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Subject *
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="bg-gray-800/50 border-gray-600 focus:border-[#72c306] text-white"
                        placeholder="What can we help you with?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Message *
                      </label>
                      <Textarea
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        className="bg-gray-800/50 border-gray-600 focus:border-[#72c306] text-white resize-none"
                        placeholder="Tell us more about your needs..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="inline-flex p-4 rounded-full bg-[#72c306]/20 mb-6"
                    >
                      <CheckCircle2 className="h-12 w-12 text-[#72c306]" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-gray-300">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Office Info & Map */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="p-8 bg-black rounded-3xl border border-gray-700/50 space-y-8">
                {/* Office Details */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Building className="h-6 w-6 text-[#72c306] mr-3" />
                    Our Headquarters
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Located in the vibrant city of Makassar, our headquarters serves as the innovation hub
                    where we develop cutting-edge AI solutions for Indonesian SMEs.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-[#72c306]/10 rounded-xl border border-[#72c306]/20">
                      <Users className="h-8 w-8 text-[#72c306] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">25+</div>
                      <div className="text-sm text-gray-400">Team Members</div>
                    </div>
                    <div className="text-center p-4 bg-[#72c306]/10 rounded-xl border border-[#72c306]/20">
                      <Globe className="h-8 w-8 text-[#72c306] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">24/7</div>
                      <div className="text-sm text-gray-400">Support</div>
                    </div>
                  </div>
                </div>

                {/* Interactive Map */}
                <div className="relative">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <MapPin className="h-5 w-5 text-[#72c306] mr-2" />
                    Interactive Map
                  </h4>
                  <div className="relative h-64 bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 rounded-2xl overflow-hidden border border-[#72c306]/30">
                    <motion.div
                      className="absolute inset-1 rounded-xl overflow-hidden"
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(114, 195, 6, 0.3)",
                          "0 0 40px rgba(114, 195, 6, 0.5)",
                          "0 0 20px rgba(114, 195, 6, 0.3)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.561106756572!2d119.43626177371388!3d-5.174062894803364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbee28b157e2795%3A0xa7cfa39bcf0288c3!2sJl.%20Cokonuri%20Raya%2C%20Gn.%20Sari%2C%20Kec.%20Rappocini%2C%20Kota%20Makassar%2C%20Sulawesi%20Selatan!5e0!3m2!1sen!2sid!4v1758569646440!5m2!1sen!2sid"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="rounded-xl"
                      />
                    </motion.div>
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
    </div>
  );
};

export default ContactPage;
