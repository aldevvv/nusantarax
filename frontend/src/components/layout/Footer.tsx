'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const Footer = () => {
  return (
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
  );
};

export default Footer;