import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { GeminiService } from '../gemini/gemini.service';
import { SendMessageDto, ChatBotResponseDto } from './dto/send-message.dto';
import { LeadCaptureDto, LeadCaptureResponseDto } from './dto/lead-capture.dto';

interface ChatSession {
  sessionId: string;
  messages: Array<{ text: string; isBot: boolean; timestamp: Date; language?: 'EN' | 'ID' }>;
  messageCount: number;
  lastActivity: Date;
  userIp: string;
  detectedLanguage?: 'EN' | 'ID';
}

@Injectable()
export class ChatBotService {
  private sessions: Map<string, ChatSession> = new Map();
  private ipMessageCounts: Map<string, { count: number; resetTime: Date }> = new Map();
  
  private readonly MAX_MESSAGES_PER_SESSION = 10;
  private readonly MAX_MESSAGES_PER_IP_PER_HOUR = 10;
  private readonly SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
  private readonly IP_RESET_INTERVAL = 60 * 60 * 1000; // 1 hour

  constructor(
    private geminiService: GeminiService,
    private configService: ConfigService,
  ) {
    // Clean up expired sessions every 30 minutes
    setInterval(() => this.cleanupExpiredSessions(), 30 * 60 * 1000);
    // Reset IP limits every hour
    setInterval(() => this.resetIpLimits(), this.IP_RESET_INTERVAL);
  }

  private detectLanguage(text: string): 'ID' | 'EN' {
    const indonesianKeywords = [
      'apa', 'bagaimana', 'kapan', 'dimana', 'mengapa', 'siapa',
      'dan', 'atau', 'dengan', 'untuk', 'dari', 'ke', 'dalam',
      'saya', 'kamu', 'kami', 'mereka', 'ini', 'itu', 'yang',
      'bisa', 'dapat', 'akan', 'sudah', 'belum', 'masih',
      'harga', 'biaya', 'gratis', 'trial', 'coba', 'daftar',
      'layanan', 'fitur', 'platform', 'bisnis', 'perusahaan'
    ];
    
    const lowerText = text.toLowerCase();
    const indonesianMatches = indonesianKeywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length;
    
    return indonesianMatches >= 2 ? 'ID' : 'EN';
  }

  private generateSystemPrompt(detectedLanguage: 'ID' | 'EN'): string {
    const knowledgeBase = {
      platform: {
        name: "NusantaraX",
        tagline: "SMEs Digital Partner",
        description: "Leading SaaS platform for Indonesian SME digital transformation with cutting-edge AI technology",
        mission: "Empowering every Indonesian SME with cutting-edge AI technology that is easily accessible, affordable, and can enhance business competitiveness in the digital era",
        vision: "To become the #1 SME digital transformation platform in Southeast Asia, creating an inclusive and sustainable business ecosystem for everyone",
        stats: {
          registeredSMEs: "10,000+",
          revenueIncrease: "300%",
          uptime: "99.9%",
          coverage: "150+ cities in Indonesia"
        },
        certifications: "Enterprise-grade security standards",
        guarantees: "30-day money-back guarantee, 14-day free trial"
      },
      founders: {
        ceo: {
          name: "Muh Alif",
          role: "CEO & Web Developer",
          description: "Visionary leader and full-stack developer, passionate about empowering Indonesian SMEs through innovative technology solutions",
          social: {
            instagram: "https://www.instagram.com/mhdalif.id/",
            linkedin: "https://www.linkedin.com/in/mhdalif-id/"
          }
        },
        creative: {
          name: "Muh Syarif", 
          role: "Creative & UI/UX Designer",
          description: "Creative mastermind focused on crafting beautiful and intuitive user experiences that drive SME success",
          social: {
            instagram: "https://www.instagram.com/syariffrahmann/",
            linkedin: "https://www.linkedin.com/in/muhammadsyarif2312/"
          }
        },
        marketing: {
          name: "Muh Fathir",
          role: "Marketing & Business Analyst", 
          description: "Data-driven marketing strategist with deep understanding of Indonesian SME market dynamics and growth opportunities",
          social: {
            instagram: "https://www.instagram.com/fatirranugrah/",
            linkedin: "https://www.linkedin.com/in/fathiranugrah/"
          }
        },
        ai: {
          name: "Muh Asrul",
          role: "Head of AI Engineering",
          description: "AI/ML expert leading the development of cutting-edge artificial intelligence solutions that power our platform",
          social: {
            instagram: "https://www.instagram.com/mharhl/",
            linkedin: "https://www.linkedin.com/in/muhasrul/"
          }
        }
      },
      values: {
        smeFirst: "Every decision we make prioritizes the interests and success of Indonesian small and medium enterprises",
        trustSecurity: "Building trust through enterprise-level data security and complete transparency in all our operations",
        innovation: "Continuously innovating with cutting-edge technology to provide the best solutions for SMEs",
        communityDriven: "Building an SME ecosystem that supports each other and grows together in the digital era"
      },
      services: {
        aiAssistant: {
          name: "AI Assistant",
          tech: "Gemini 2.5 Pro",
          description: "Specialized digital marketing expert exclusively focused on providing expert digital marketing advice, strategies, and insights",
          features: [
            "Natural Language Processing", 
            "Multi-platform Integration", 
            "Analytics Dashboard", 
            "Image analysis (10MB, 24h cache)", 
            "Business context integration",
            "One session per user (persistent chat)",
            "Context-aware responses",
            "Token tracking & analytics"
          ],
          expertise: [
            "Social Media Marketing",
            "Content Marketing & SEO", 
            "E-commerce Optimization",
            "Indonesian Market Focus",
            "Platform strategy for Tokopedia, Shopee, Lazada",
            "Local consumer behavior analysis",
            "Customer journey mapping",
            "Brand development and positioning",
            "Marketing automation"
          ]
        },
        imageGenerator: {
          name: "Image Generator",
          tech: "Imagen 4.0 with Gemini 2.5 Pro enhancement", 
          description: "Professional image creation with AI-powered prompt enhancement and business context integration",
          features: [
            "Template Library with 18+ categories", 
            "Brand Consistency", 
            "High Resolution PNG Output", 
            "1-12 images per generation", 
            "Multiple aspect ratios (1:1, 3:4, 9:16, 16:9)",
            "Business context integration",
            "Batch generation support",
            "AI-powered prompt enhancement pipeline"
          ],
          categories: [
            "Food & Beverage", "Fashion & Apparel", "Technology & Software", "Health & Beauty",
            "Education & Training", "Retail & E-commerce", "Services & Consulting", "Manufacturing",
            "Agriculture & Farming", "Tourism & Hospitality", "Arts & Crafts", "Automotive",
            "Construction & Real Estate", "Finance & Insurance", "Media & Entertainment", "Sports & Recreation",
            "Home & Garden", "Other"
          ]
        },
        captionGenerator: {
          name: "Caption Generator",
          tech: "Gemini 2.5 Pro",
          description: "Social media captions with advanced 10-metric scoring system and platform optimization",
          features: [
            "Platform-specific optimization (Instagram, Facebook, TikTok)", 
            "Bilingual support (Indonesian/English)", 
            "10-metric scoring system", 
            "Hashtag Optimization",
            "7 writing tones (Professional, Casual, Funny, Inspiring, Sales, Educational, Storytelling)",
            "3 caption lengths (Short 50-100 chars, Medium 150-250 chars, Long 350+ chars)",
            "Business brand voice integration",
            "Emoji control with filtering"
          ],
          scoring: [
            "Engagement Score", "Readability Score", "CTA Strength", "Brand Voice Score", 
            "Trending Potential", "Platform Optimization", "Hashtag Effectiveness", 
            "Audience Targeting", "Content Quality", "Conversion Potential"
          ]
        },
        businessInfo: {
          name: "Business Information Management",
          description: "Comprehensive business profile management with AI context integration",
          features: [
            "18 business categories with subcategories",
            "Brand identity management (colors, voice, personality)",
            "AI-specific configuration for content generation",
            "Business sizes (MICRO/SMALL/MEDIUM/LARGE)",
            "Contact & location management",
            "Social media integration",
            "Logo management (5MB limit)",
            "Brand voice options (8 types): Professional, Casual, Friendly, Authoritative, Humorous, Educational, Inspirational, Trustworthy",
            "Brand personality traits (12 options): Innovative, Trustworthy, Creative, Reliable, Modern, Traditional, Bold, Elegant, Fun, Sophisticated, Caring, Dynamic"
          ]
        },
        wallet: {
          name: "Wallet & Billing System",
          description: "Comprehensive wallet management with Midtrans integration for Indonesian market",
          features: [
            "IDR-based payment system",
            "Midtrans payment gateway integration",
            "Automatic subscription billing",
            "Real-time usage synchronization", 
            "Payment methods: QRIS, SeaBank, AlloBank, BLU BCA, GOPAY, DANA",
            "Transaction history with detailed filtering",
            "Auto-renewal with wallet balance check",
            "Monthly and yearly billing cycles"
          ]
        }
      },
      pricing: {
        free: { 
          price: "Rp0/month", 
          requests: "50/month", 
          features: "Basic AI features access, Perfect for testing the platform",
          description: "Starter features for new users"
        },
        basic: { 
          price: "Rp15,000/month", 
          requests: "750/month", 
          features: "AI Assistant, Image Generation (750/month), Captions (750/month), Basic Analytics, Email Support",
          description: "Perfect for SMEs just starting their digital transformation"
        },
        pro: { 
          price: "Rp35,000/month", 
          requests: "2,500/month", 
          features: "AI Assistant Advanced, Image Generation (2500/month), Captions (2500/month), Advanced Analytics, Priority Support, Custom Branding, Access for New Features", 
          popular: true,
          description: "Complete solution for growing SMEs"
        },
        enterprise: { 
          price: "Rp150,000/month", 
          requests: "Unlimited", 
          features: "All Pro features + Unlimited Image Generation, Unlimited Captions, Custom Features, API Access, White Label Solution, 24/7 Priority Support, Custom Integration",
          description: "Custom solution for large enterprises and franchises"
        }
      },
      contact: {
        supportEmail: "support@nusantarax.web.id",
        salesEmail: "sales@nusantarax.web.id",
        privacyEmail: "privacy@nusantarax.web.id",
        phone: "+6289643143750",
        whatsapp: "+6289643143750",
        address: "Jl. Cokonuri Raya Dalam 1, Rappocini, Makassar City, South Sulawesi",
        fullAddress: "Jl. Cokonuri Raya Gunung Sari, Rappocini, Makassar City, South Sulawesi",
        businessHours: "Monday - Friday: 09:00 - 18:00 WIB, Saturday: 09:00 - 15:00 WIB",
        dailyHours: "07:00-22:00 daily"
      },
      social: {
        instagram: "https://www.instagram.com/nusantarax.id/",
        facebook: "https://web.facebook.com/profile.php?id=61581421463583", 
        youtube: "https://www.youtube.com/@nusantarax-id",
        tiktok: "https://www.tiktok.com/nusantarax.id"
      },
      technology: {
        aiModels: ["Google Gemini 2.5 Pro", "Google Imagen 4.0"],
        infrastructure: ["Supabase", "AWS", "Google Cloud Platform", "PostgreSQL database with encryption"],
        paymentGateway: "Midtrans (Indonesia's leading payment gateway)",
        security: ["Argon2 password hashing", "JWT authentication", "OAuth integration (GitHub, Google)", "HTTPS encryption", "Enterprise-grade data security", "Role-based access controls"],
        partnerships: ["OpenAI", "Anthropic Claude", "Google", "AWS", "Digital Ocean", "Docker", "Microsoft Azure", "GitLab", "GitHub", "Cisco"]
      },
      journey: [
        {
          phase: "Phase 1 - Problem Analysis",
          description: "Deep research into Indonesian SME challenges in digital adoption, market barriers, and technology gaps to understand core pain points"
        },
        {
          phase: "Phase 2 - Ideation & Concept", 
          description: "Developing the vision for an AI-powered platform that could democratize digital tools for Indonesian small and medium enterprises"
        },
        {
          phase: "Phase 3 - Research & Development",
          description: "Building the core AI technologies, designing user interfaces, and creating scalable infrastructure for nationwide SME support"
        },
        {
          phase: "Phase 4 - Testing & Validation",
          description: "Pilot programs with selected SMEs, gathering feedback, refining features, and validating our solution effectiveness"
        },
        {
          phase: "Phase 5 - Official Launch",
          description: "Full platform launch with complete AI suite - empowering thousands of Indonesian SMEs to transform their businesses digitally"
        }
      ],
      testimonials: [
        {
          name: "Sarah Johnson",
          role: "Owner Local Food Hub",
          location: "Jakarta",
          testimonial: "NusantaraX helped my restaurant get more customers through social media. The AI Assistant is incredibly helpful for answering customer questions!"
        },
        {
          name: "Michael Chen", 
          role: "Founder Heritage Crafts",
          location: "Yogyakarta",
          testimonial: "The Image Generator is amazing! Now I can create professional visual content without hiring a designer. The ROI is incredibly high."
        },
        {
          name: "Lisa Wong",
          role: "CEO Beauty Care Indonesia", 
          location: "Surabaya",
          testimonial: "The analytics dashboard helped me understand customer behavior. Online sales increased 300% within 6 months of using NusantaraX."
        }
      ],
      headquarters: {
        teamSize: "25+ team members",
        location: "Makassar, South Sulawesi",
        description: "Located in the vibrant city of Makassar, our headquarters serves as the innovation hub where we develop cutting-edge AI solutions for Indonesian SMEs"
      },
      faq: [
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
          answer: "We take security seriously. NusantaraX uses enterprise-grade encryption to protect your data. All information is stored securely and we comply with international data protection standards including Indonesian data protection laws."
        },
        {
          question: "Can I upgrade or downgrade my plan anytime?",
          answer: "Absolutely! You can change your subscription plan at any time. Upgrades take effect immediately, and downgrades will take effect at the end of your current billing cycle. We also offer a 30-day money-back guarantee."
        },
        {
          question: "Do you provide customer support?",
          answer: "Yes, we provide 24/7 customer support via email, chat, and WhatsApp. Professional and Enterprise plans also include priority support and dedicated account managers to ensure your success."
        }
      ]
    };

    if (detectedLanguage === 'ID') {
      return `Kamu adalah NusantaraX Assistant, chatbot resmi untuk platform NusantaraX.
Tugasmu adalah membantu calon customers memahami platform dan layanan kami.

IDENTITAS:
- Nama: NusantaraX Assistant
- Personality: Ramah, profesional, membantu, antusias tentang teknologi AI
- Bahasa: Bahasa Indonesia (karena user menggunakan Bahasa Indonesia)
- Tone: Casual tapi profesional, mudah dipahami untuk pemilik UMKM

TENTANG NUSANTARAX:
NusantaraX adalah platform SaaS terdepan untuk transformasi digital UMKM Indonesia dengan teknologi AI cutting-edge.

MISI: ${knowledgeBase.platform.mission}

VISI: ${knowledgeBase.platform.vision}

NILAI-NILAI PERUSAHAAN:
• SME First: ${knowledgeBase.values.smeFirst}
• Trust & Security: ${knowledgeBase.values.trustSecurity}
• Innovation: ${knowledgeBase.values.innovation}
• Community Driven: ${knowledgeBase.values.communityDriven}

FOUNDER & LEADERSHIP TEAM:
• Muh Alif - CEO & Web Developer: ${knowledgeBase.founders.ceo.description}
• Muh Syarif - Creative & UI/UX Designer: ${knowledgeBase.founders.creative.description}
• Muh Fathir - Marketing & Business Analyst: ${knowledgeBase.founders.marketing.description}
• Muh Asrul - Head of AI Engineering: ${knowledgeBase.founders.ai.description}

LAYANAN UTAMA:
• AI Assistant (${knowledgeBase.services.aiAssistant.tech}): ${knowledgeBase.services.aiAssistant.description}
  - Fitur: ${knowledgeBase.services.aiAssistant.features.join(', ')}
  - Keahlian: ${knowledgeBase.services.aiAssistant.expertise.join(', ')}

• Image Generator (${knowledgeBase.services.imageGenerator.tech}): ${knowledgeBase.services.imageGenerator.description}
  - Fitur: ${knowledgeBase.services.imageGenerator.features.join(', ')}
  - Kategori: ${knowledgeBase.services.imageGenerator.categories.join(', ')}

• Caption Generator (${knowledgeBase.services.captionGenerator.tech}): ${knowledgeBase.services.captionGenerator.description}
  - Fitur: ${knowledgeBase.services.captionGenerator.features.join(', ')}
  - 10 Metrik Scoring: ${knowledgeBase.services.captionGenerator.scoring.join(', ')}

• Business Information Management: ${knowledgeBase.services.businessInfo.description}
  - Fitur: ${knowledgeBase.services.businessInfo.features.join(', ')}

• Wallet & Billing System: ${knowledgeBase.services.wallet.description}
  - Fitur: ${knowledgeBase.services.wallet.features.join(', ')}

PAKET HARGA:
• FREE: ${knowledgeBase.pricing.free.price} (${knowledgeBase.pricing.free.requests}) - ${knowledgeBase.pricing.free.description}
• Basic: ${knowledgeBase.pricing.basic.price} (${knowledgeBase.pricing.basic.requests}) - ${knowledgeBase.pricing.basic.description}
• Pro: ${knowledgeBase.pricing.pro.price} (${knowledgeBase.pricing.pro.requests}) ⭐ Paling Populer - ${knowledgeBase.pricing.pro.description}
• Enterprise: ${knowledgeBase.pricing.enterprise.price} (${knowledgeBase.pricing.enterprise.requests}) - ${knowledgeBase.pricing.enterprise.description}

STATISTIK PLATFORM:
• ${knowledgeBase.platform.stats.registeredSMEs} UMKM terdaftar
• ${knowledgeBase.platform.stats.revenueIncrease} rata-rata peningkatan penjualan dalam 6 bulan
• ${knowledgeBase.platform.stats.uptime} uptime platform
• Jangkauan ${knowledgeBase.platform.stats.coverage}

KONTAK:
• Email Support: ${knowledgeBase.contact.supportEmail}
• Email Sales: ${knowledgeBase.contact.salesEmail}
• WhatsApp: ${knowledgeBase.contact.whatsapp}
• Alamat: ${knowledgeBase.contact.address}
• Jam Operasional: ${knowledgeBase.contact.businessHours}
• Support 24/7: ${knowledgeBase.contact.dailyHours}

KANTOR PUSAT:
${knowledgeBase.headquarters.description}
Tim: ${knowledgeBase.headquarters.teamSize}

SOCIAL MEDIA:
Instagram: ${knowledgeBase.social.instagram}
Facebook: ${knowledgeBase.social.facebook}
YouTube: ${knowledgeBase.social.youtube}
TikTok: ${knowledgeBase.social.tiktok}

TEKNOLOGI & KEAMANAN:
• AI Models: ${knowledgeBase.technology.aiModels.join(', ')}
• Infrastructure: ${knowledgeBase.technology.infrastructure.join(', ')}
• Security: ${knowledgeBase.technology.security.join(', ')}
• Standar Keamanan: ${knowledgeBase.platform.certifications}

FAQ POPULER:
${knowledgeBase.faq.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n')}

TESTIMONIAL PELANGGAN:
${knowledgeBase.testimonials.map(t => `"${t.testimonial}" - ${t.name}, ${t.role}, ${t.location}`).join('\n\n')}

ATURAN RESPONS:
1. HANYA jawab pertanyaan tentang platform NusantaraX
2. Jika ditanya topik lain, arahkan ke layanan AI Assistant yang lebih advanced
3. Berikan informasi akurat berdasarkan knowledge base lengkap
4. Tawarkan trial gratis dan registrasi jika user tertarik
5. Untuk info teknis detail, arahkan ke halaman documentation
6. Untuk sales inquiry, arahkan ke tim sales
7. Sebutkan founder dan tim jika ditanya tentang perusahaan
8. Jelaskan value proposition dan unique selling points

GAYA RESPONS:
- Jawab dengan ramah dan jelas dalam Bahasa Indonesia
- Gunakan bullet points untuk info yang banyak
- Maksimal 200 kata per respons
- Sertakan emoji yang relevan untuk engagement
- Akhiri dengan pertanyaan follow-up jika sesuai`;
    } else {
      return `You are the NusantaraX Assistant, the official chatbot for NusantaraX platform.
Your job is to help prospective customers understand our platform and services.

IDENTITY:
- Name: NusantaraX Assistant
- Personality: Friendly, professional, helpful, enthusiastic about AI technology
- Language: English (user is using English)
- Tone: Casual but professional, easy to understand for SME owners

ABOUT NUSANTARAX:
NusantaraX is Indonesia's leading SaaS platform for SME digital transformation with cutting-edge AI technology.

MISSION: ${knowledgeBase.platform.mission}

VISION: ${knowledgeBase.platform.vision}

COMPANY VALUES:
• SME First: ${knowledgeBase.values.smeFirst}
• Trust & Security: ${knowledgeBase.values.trustSecurity}
• Innovation: ${knowledgeBase.values.innovation}
• Community Driven: ${knowledgeBase.values.communityDriven}

FOUNDERS & LEADERSHIP TEAM:
• Muh Alif - CEO & Web Developer: ${knowledgeBase.founders.ceo.description}
• Muh Syarif - Creative & UI/UX Designer: ${knowledgeBase.founders.creative.description}
• Muh Fathir - Marketing & Business Analyst: ${knowledgeBase.founders.marketing.description}
• Muh Asrul - Head of AI Engineering: ${knowledgeBase.founders.ai.description}

MAIN SERVICES:
• AI Assistant (${knowledgeBase.services.aiAssistant.tech}): ${knowledgeBase.services.aiAssistant.description}
  - Features: ${knowledgeBase.services.aiAssistant.features.join(', ')}
  - Expertise: ${knowledgeBase.services.aiAssistant.expertise.join(', ')}

• Image Generator (${knowledgeBase.services.imageGenerator.tech}): ${knowledgeBase.services.imageGenerator.description}
  - Features: ${knowledgeBase.services.imageGenerator.features.join(', ')}
  - Categories: ${knowledgeBase.services.imageGenerator.categories.join(', ')}

• Caption Generator (${knowledgeBase.services.captionGenerator.tech}): ${knowledgeBase.services.captionGenerator.description}
  - Features: ${knowledgeBase.services.captionGenerator.features.join(', ')}
  - 10-Metric Scoring: ${knowledgeBase.services.captionGenerator.scoring.join(', ')}

• Business Information Management: ${knowledgeBase.services.businessInfo.description}
  - Features: ${knowledgeBase.services.businessInfo.features.join(', ')}

• Wallet & Billing System: ${knowledgeBase.services.wallet.description}
  - Features: ${knowledgeBase.services.wallet.features.join(', ')}

PRICING PLANS:
• FREE: ${knowledgeBase.pricing.free.price} (${knowledgeBase.pricing.free.requests}) - ${knowledgeBase.pricing.free.description}
• Basic: ${knowledgeBase.pricing.basic.price} (${knowledgeBase.pricing.basic.requests}) - ${knowledgeBase.pricing.basic.description}
• Pro: ${knowledgeBase.pricing.pro.price} (${knowledgeBase.pricing.pro.requests}) ⭐ Most Popular - ${knowledgeBase.pricing.pro.description}
• Enterprise: ${knowledgeBase.pricing.enterprise.price} (${knowledgeBase.pricing.enterprise.requests}) - ${knowledgeBase.pricing.enterprise.description}

PLATFORM STATISTICS:
• ${knowledgeBase.platform.stats.registeredSMEs} registered SMEs
• ${knowledgeBase.platform.stats.revenueIncrease} average revenue increase within 6 months
• ${knowledgeBase.platform.stats.uptime} platform uptime
• Coverage across ${knowledgeBase.platform.stats.coverage}

CONTACT INFORMATION:
• Support Email: ${knowledgeBase.contact.supportEmail}
• Sales Email: ${knowledgeBase.contact.salesEmail}
• WhatsApp: ${knowledgeBase.contact.whatsapp}
• Address: ${knowledgeBase.contact.address}
• Business Hours: ${knowledgeBase.contact.businessHours}
• 24/7 Support: ${knowledgeBase.contact.dailyHours}

HEADQUARTERS:
${knowledgeBase.headquarters.description}
Team: ${knowledgeBase.headquarters.teamSize}

SOCIAL MEDIA:
Instagram: ${knowledgeBase.social.instagram}
Facebook: ${knowledgeBase.social.facebook}
YouTube: ${knowledgeBase.social.youtube}
TikTok: ${knowledgeBase.social.tiktok}

TECHNOLOGY & SECURITY:
• AI Models: ${knowledgeBase.technology.aiModels.join(', ')}
• Infrastructure: ${knowledgeBase.technology.infrastructure.join(', ')}
• Security: ${knowledgeBase.technology.security.join(', ')}
• Security Standards: ${knowledgeBase.platform.certifications}

FREQUENTLY ASKED QUESTIONS:
${knowledgeBase.faq.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n')}

CUSTOMER TESTIMONIALS:
${knowledgeBase.testimonials.map(t => `"${t.testimonial}" - ${t.name}, ${t.role}, ${t.location}`).join('\n\n')}

RESPONSE RULES:
1. ONLY answer questions about NusantaraX platform
2. If asked about other topics, redirect to our AI Assistant service
3. Provide accurate information based on comprehensive knowledge base
4. Offer free trial and registration if user shows interest
5. For detailed technical info, direct to documentation page
6. For sales inquiries, direct to sales team
7. Mention founders and team when asked about the company
8. Explain value proposition and unique selling points

RESPONSE STYLE:
- Answer warmly and clearly in English
- Use bullet points for multiple information pieces
- Maximum 200 words per response
- Include relevant emojis for engagement
- End with follow-up question if appropriate`;
    }
  }

  private checkRateLimit(userIp: string): boolean {
    const now = new Date();
    const ipData = this.ipMessageCounts.get(userIp);

    if (!ipData || now.getTime() - ipData.resetTime.getTime() > this.IP_RESET_INTERVAL) {
      this.ipMessageCounts.set(userIp, { count: 1, resetTime: now });
      return true;
    }

    if (ipData.count >= this.MAX_MESSAGES_PER_IP_PER_HOUR) {
      return false;
    }

    ipData.count++;
    return true;
  }

  private getOrCreateSession(sessionId: string, userIp: string): ChatSession {
    const existingSession = this.sessions.get(sessionId);
    
    if (existingSession && this.isSessionValid(existingSession)) {
      existingSession.lastActivity = new Date();
      return existingSession;
    }

    const newSession: ChatSession = {
      sessionId,
      messages: [],
      messageCount: 0,
      lastActivity: new Date(),
      userIp
    };

    this.sessions.set(sessionId, newSession);
    return newSession;
  }

  private isSessionValid(session: ChatSession): boolean {
    const now = new Date();
    return now.getTime() - session.lastActivity.getTime() < this.SESSION_TIMEOUT;
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
      }
    }
  }

  private resetIpLimits(): void {
    const now = new Date();
    for (const [ip, data] of this.ipMessageCounts.entries()) {
      if (now.getTime() - data.resetTime.getTime() > this.IP_RESET_INTERVAL) {
        this.ipMessageCounts.delete(ip);
      }
    }
  }

  async sendMessage(sendMessageDto: SendMessageDto): Promise<ChatBotResponseDto> {
    const { message, sessionId = `session_${Date.now()}`, userIp = 'unknown' } = sendMessageDto;
    const startTime = Date.now();

    // Check rate limiting
    if (!this.checkRateLimit(userIp)) {
      throw new BadRequestException('Rate limit exceeded. Please try again later.');
    }

    // Get or create session
    const session = this.getOrCreateSession(sessionId, userIp);

    // Check session message limit
    if (session.messageCount >= this.MAX_MESSAGES_PER_SESSION) {
      throw new BadRequestException('Session message limit reached. Please start a new session.');
    }

    // Detect language
    const detectedLanguage = this.detectLanguage(message);
    session.detectedLanguage = detectedLanguage;

    // Build context from recent messages
    const recentMessages = session.messages.slice(-6); // Last 6 messages for context
    const conversationHistory = recentMessages
      .map(msg => `${msg.isBot ? 'Assistant' : 'User'}: ${msg.text}`)
      .join('\n');

    // Create comprehensive prompt
    const systemPrompt = this.generateSystemPrompt(detectedLanguage);
    const contextualPrompt = `${systemPrompt}

${recentMessages.length > 0 ? `\nCONVERSATION HISTORY:\n${conversationHistory}\n` : ''}

USER MESSAGE: ${message}

Respond helpfully and stay in character as NusantaraX Assistant. Remember to:
- Match the detected language (${detectedLanguage === 'ID' ? 'Bahasa Indonesia' : 'English'})
- Keep responses under 200 words
- Include relevant emojis
- Offer next steps or ask follow-up questions when appropriate
- Stay focused on NusantaraX platform topics only`;

    try {
      // Generate response using Gemini
      const aiResponse = await this.geminiService.generateContent(
        contextualPrompt,
        undefined,
        'gemini-2.5-pro',
        'chatbot-public'
      );

      // Determine if we should show lead capture
      const shouldShowLeadCapture = this.shouldShowLeadCapture(message, session.messageCount);

      // Generate suggested questions if appropriate
      const suggestedQuestions = this.generateSuggestedQuestions(detectedLanguage, message);

      // Update session
      session.messages.push(
        { text: message, isBot: false, timestamp: new Date(), language: detectedLanguage },
        { text: aiResponse, isBot: true, timestamp: new Date(), language: detectedLanguage }
      );
      session.messageCount++;
      session.lastActivity = new Date();

      const responseTime = Date.now() - startTime;

      return {
        message: aiResponse,
        detectedLanguage,
        sessionId,
        suggestedQuestions,
        showLeadCapture: shouldShowLeadCapture,
        metadata: {
          responseTime,
          model: 'gemini-2.5-pro',
          tokenUsage: this.estimateTokens(contextualPrompt + aiResponse)
        }
      };

    } catch (error) {
      console.error('ChatBot service error:', error);
      
      // Fallback response based on language
      const fallbackMessage = detectedLanguage === 'ID' 
        ? "Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi nanti atau hubungi tim support kami di support@nusantarax.web.id"
        : "Sorry, I'm experiencing technical difficulties. Please try again later or contact our support team at support@nusantarax.web.id";

      return {
        message: fallbackMessage,
        detectedLanguage,
        sessionId,
        metadata: {
          responseTime: Date.now() - startTime,
          model: 'fallback',
          tokenUsage: 0
        }
      };
    }
  }

  private shouldShowLeadCapture(message: string, messageCount: number): boolean {
    const lowerMessage = message.toLowerCase();
    const leadTriggerKeywords = [
      'price', 'pricing', 'cost', 'trial', 'demo', 'contact', 'sales',
      'harga', 'biaya', 'trial', 'coba', 'gratis', 'kontak', 'daftar',
      'interested', 'tertarik', 'want to try', 'ingin coba', 'founder',
      'team', 'perusahaan', 'company'
    ];

    const hasLeadKeyword = leadTriggerKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );

    return (messageCount >= 3 && hasLeadKeyword) || messageCount >= 5;
  }

  private generateSuggestedQuestions(language: 'ID' | 'EN', lastMessage: string): string[] {
    const lowerMessage = lastMessage.toLowerCase();

    if (language === 'ID') {
      if (lowerMessage.includes('harga') || lowerMessage.includes('biaya')) {
        return [
          "Apakah ada trial gratis?",
          "Apa perbedaan antara paket Basic dan Pro?",
          "Bagaimana cara pembayaran?"
        ];
      }
      if (lowerMessage.includes('layanan') || lowerMessage.includes('fitur')) {
        return [
          "Bagaimana cara kerja AI Assistant?",
          "Apa keunggulan Image Generator?",
          "Platform media sosial apa saja yang didukung?"
        ];
      }
      if (lowerMessage.includes('founder') || lowerMessage.includes('tim') || lowerMessage.includes('perusahaan')) {
        return [
          "Siapa saja founder NusantaraX?",
          "Berapa banyak tim yang bekerja di NusantaraX?",
          "Dimana kantor pusat NusantaraX?"
        ];
      }
      return [
        "Apa keunggulan NusantaraX dibanding platform lain?",
        "Berapa lama trial gratis yang tersedia?",
        "Bagaimana cara menghubungi customer support?"
      ];
    } else {
      if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return [
          "Is there a free trial available?",
          "What's the difference between Basic and Pro plans?",
          "What payment methods do you accept?"
        ];
      }
      if (lowerMessage.includes('service') || lowerMessage.includes('feature')) {
        return [
          "How does the AI Assistant work?",
          "What are Image Generator capabilities?",
          "Which social media platforms are supported?"
        ];
      }
      if (lowerMessage.includes('founder') || lowerMessage.includes('team') || lowerMessage.includes('company')) {
        return [
          "Who are the founders of NusantaraX?",
          "How big is the NusantaraX team?",
          "Where is NusantaraX headquarters located?"
        ];
      }
      return [
        "What makes NusantaraX different from other platforms?",
        "How long is the free trial available?",
        "How can I contact customer support?"
      ];
    }
  }

  async captureLeads(leadCaptureDto: LeadCaptureDto): Promise<LeadCaptureResponseDto> {
    try {
      const resend = new Resend(this.configService.get('RESEND_API_KEY'));
      const emailFrom = this.configService.get('EMAIL_FROM');
      
      // Send notification to sales team
      const emailSubject = 'New Lead from ChatBot - NusantaraX';
      const emailContent = `
        <h2>New Lead from ChatBot</h2>
        <p>A new lead has been captured from the NusantaraX ChatBot:</p>
        
        <ul>
          <li><strong>Name:</strong> ${leadCaptureDto.fullName}</li>
          <li><strong>Email:</strong> ${leadCaptureDto.email}</li>
          <li><strong>Phone:</strong> ${leadCaptureDto.phone || 'Not provided'}</li>
          <li><strong>Company:</strong> ${leadCaptureDto.company || 'Not provided'}</li>
          <li><strong>Session ID:</strong> ${leadCaptureDto.sessionId}</li>
          <li><strong>User IP:</strong> ${leadCaptureDto.userIp}</li>
          <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
        </ul>
        
        <p>Please follow up within 24 hours.</p>
      `;

      await resend.emails.send({
        from: emailFrom,
        to: 'sales@nusantarax.web.id',
        subject: emailSubject,
        html: emailContent,
      });

      // Send auto-response to lead
      const autoResponseSubject = 'Thank you for your interest in NusantaraX!';
      const autoResponseContent = `
        <h2>Thank you for your interest in NusantaraX!</h2>
        <p>Dear ${leadCaptureDto.fullName},</p>
        
        <p>Thank you for your interest in NusantaraX! Our team will contact you within 24 hours to discuss how our AI-powered platform can help transform your business.</p>
        
        <p>In the meantime, feel free to:</p>
        <ul>
          <li>Explore our documentation: <a href="https://nusantarax.web.id/documentation">https://nusantarax.web.id/documentation</a></li>
          <li>Start your 14-day free trial: <a href="https://nusantarax.web.id/register">https://nusantarax.web.id/register</a></li>
          <li>Follow us on social media for updates and tips</li>
        </ul>
        
        <p>Best regards,<br>NusantaraX Team</p>
        
        <hr>
        <p><small>
          NusantaraX - SMEs Digital Partner<br>
          Email: support@nusantarax.web.id<br>
          Phone: +6289643143750<br>
          Website: https://nusantarax.web.id
        </small></p>
      `;

      await resend.emails.send({
        from: emailFrom,
        to: leadCaptureDto.email,
        subject: autoResponseSubject,
        html: autoResponseContent,
      });

      return {
        success: true,
        message: 'Thank you! Our team will contact you soon.',
        leadId: `lead_${Date.now()}`
      };

    } catch (error) {
      console.error('Lead capture error:', error);
      return {
        success: false,
        message: 'Something went wrong. Please try again or contact us directly.'
      };
    }
  }

  getSuggestedQuestions(): { categories: any[] } {
    return {
      categories: [
        {
          label: "Platform Overview",
          questions: [
            {
              en: "What is NusantaraX and how can it help my business?",
              id: "Apa itu NusantaraX dan bagaimana bisa membantu bisnis saya?"
            },
            {
              en: "What AI services are available?",
              id: "Layanan AI apa saja yang tersedia?"
            },
            {
              en: "Who are the founders of NusantaraX?",
              id: "Siapa saja founder NusantaraX?"
            }
          ]
        },
        {
          label: "Services & Features",
          questions: [
            {
              en: "How does the AI Assistant work?",
              id: "Bagaimana cara kerja AI Assistant?"
            },
            {
              en: "What are Image Generator capabilities?",
              id: "Apa kemampuan Image Generator?"
            },
            {
              en: "What is the Caption Generator scoring system?",
              id: "Apa itu sistem scoring Caption Generator?"
            }
          ]
        },
        {
          label: "Pricing & Plans",
          questions: [
            {
              en: "How much does it cost?",
              id: "Berapa biaya untuk menggunakan platform ini?"
            },
            {
              en: "Is there a free trial?",
              id: "Apakah ada trial gratis?"
            },
            {
              en: "What's included in the Pro plan?",
              id: "Apa saja yang termasuk dalam paket Pro?"
            }
          ]
        },
        {
          label: "Company & Support",
          questions: [
            {
              en: "How can I contact the founders?",
              id: "Bagaimana cara menghubungi founder?"
            },
            {
              en: "Where is NusantaraX headquarters?",
              id: "Dimana kantor pusat NusantaraX?"
            },
            {
              en: "How can I contact customer support?",
              id: "Bagaimana menghubungi customer support?"
            }
          ]
        }
      ]
    };
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  // Get session statistics for monitoring
  getSessionStats() {
    return {
      activeSessions: this.sessions.size,
      totalIpsTracked: this.ipMessageCounts.size,
      timestamp: new Date().toISOString()
    };
  }
}