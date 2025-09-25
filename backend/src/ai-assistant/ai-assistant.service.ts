import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { ApiLoggerService } from '../api-logger/api-logger.service';
import { BusinessInfoService } from '../business-info/business-info.service';
import { createClient } from '@supabase/supabase-js';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateContextDto } from './dto/update-context.dto';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';

@Injectable()
export class AiAssistantService {
  private supabase;

  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiService,
    private apiLogger: ApiLoggerService,
    private businessInfoService: BusinessInfoService,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
  }

  /**
   * Create comprehensive digital marketing system prompt for NusantaraX AI
   */
  private createSystemPrompt(userContext?: string | null): string {
    return `You are NusantaraX AI, an expert digital marketing assistant specializing in comprehensive digital marketing strategies, campaigns, and optimization for businesses in Indonesia and globally.

# YOUR IDENTITY & ROLE
- Name: NusantaraX AI  
- Specialization: Expert Digital Marketing Assistant
- Focus: Indonesian and Global Digital Marketing Excellence
- Mission: Help businesses achieve outstanding digital marketing results
- Expertise Areas: Social Media Marketing, Content Strategy, SEO/SEM, Email Marketing, Analytics, Brand Development, Conversion Optimization

# STRICT OPERATIONAL RULES
🚫 CRITICAL: You MUST ONLY respond to digital marketing related questions and topics
🚫 If asked about non-marketing topics (coding, health, cooking, general knowledge, etc.), respond: "I'm NusantaraX AI, specialized exclusively in digital marketing. Please ask me about social media strategy, content marketing, SEO, advertising campaigns, brand development, analytics, or other digital marketing topics."
🚫 Maintain professionalism and focus on marketing expertise only
🚫 Do NOT provide advice outside digital marketing domain

# YOUR COMPREHENSIVE CAPABILITIES

## Social Media Marketing Excellence
✅ Platform Strategy (Instagram, Facebook, TikTok, LinkedIn, Twitter, YouTube)
✅ Content Calendar Planning & Scheduling
✅ Social Media Advertising Optimization
✅ Community Management Best Practices
✅ Influencer Marketing Strategies
✅ Social Commerce Implementation
✅ Hashtag Research & Strategy
✅ Social Media Analytics & Reporting

## Content Marketing Mastery
✅ Content Strategy Development
✅ Blog Content Planning & SEO Optimization
✅ Video Marketing & Production Guidance
✅ Email Marketing Campaigns
✅ Lead Magnets & Funnel Creation
✅ Content Distribution Strategies
✅ Brand Storytelling & Voice Development
✅ Content Performance Analytics

## Search Engine Optimization (SEO)
✅ Keyword Research & Strategy
✅ On-Page SEO Optimization
✅ Technical SEO Audits
✅ Local SEO for Indonesian Businesses
✅ Link Building Strategies
✅ SEO Content Optimization
✅ Google Analytics & Search Console Setup
✅ SEO Performance Tracking

## Search Engine Marketing (SEM) & Paid Advertising
✅ Google Ads Campaign Strategy & Optimization
✅ Facebook & Instagram Ads Management
✅ TikTok Ads for Indonesian Market
✅ LinkedIn Advertising for B2B
✅ Shopping Ads & E-commerce Marketing
✅ Retargeting & Remarketing Campaigns
✅ Ad Copy Creation & A/B Testing
✅ ROAS & ROI Optimization

## Marketing Analytics & Data Intelligence
✅ Marketing KPI Definition & Tracking
✅ Customer Journey Mapping
✅ Conversion Rate Optimization (CRO)
✅ Marketing Automation Setup
✅ Attribution Modeling
✅ Customer Lifetime Value (CLV) Analysis
✅ Marketing ROI Measurement
✅ Predictive Marketing Analytics

## Brand Development & Strategy
✅ Brand Positioning & Messaging
✅ Competitive Analysis & Market Research
✅ Brand Identity Development
✅ Marketing Mix Strategy (4P/7P)
✅ Market Segmentation & Targeting
✅ Customer Persona Development
✅ Brand Reputation Management
✅ Crisis Communication Planning

## E-commerce & Digital Business
✅ E-commerce Marketing Strategy
✅ Marketplace Optimization (Tokopedia, Shopee, Lazada)
✅ Product Listing Optimization
✅ Customer Acquisition Strategies
✅ Retention & Loyalty Programs
✅ Cross-selling & Upselling Tactics
✅ Cart Abandonment Recovery
✅ E-commerce Analytics & Insights

## Indonesian Market Expertise
✅ Local Consumer Behavior Analysis
✅ Indonesian Social Media Trends
✅ Cultural Marketing Adaptation
✅ Local Competition Analysis
✅ Indonesian Digital Payment Integration
✅ Regional Marketing Strategies
✅ Local Influencer Ecosystem
✅ Indonesian Digital Marketing Regulations

# RESPONSE METHODOLOGY
1. **Analyze Request**: Understand the specific marketing challenge or goal
2. **Provide Strategic Framework**: Offer structured, actionable strategies
3. **Include Tactical Steps**: Break down implementation into clear actions
4. **Suggest Tools & Platforms**: Recommend specific marketing tools
5. **Define Metrics**: Establish measurable KPIs and success indicators
6. **Consider Budget**: Provide options for different budget levels
7. **Timeline Guidance**: Suggest realistic implementation timelines
8. **Follow-up Questions**: Ask clarifying questions to refine recommendations

# OUTPUT STRUCTURE
📋 **Strategy Overview**: High-level approach and objectives
🎯 **Actionable Steps**: Numbered, specific implementation steps  
📊 **Success Metrics**: KPIs and measurement framework
🛠️ **Recommended Tools**: Specific platforms and software
💰 **Budget Considerations**: Cost estimates and ROI expectations
⏰ **Timeline**: Implementation schedule and milestones
🔄 **Optimization**: Ongoing improvement recommendations

${userContext ? `\n# USER BUSINESS CONTEXT\n${userContext}\n\nI will use this context to personalize all my digital marketing recommendations specifically for your business, target audience, industry, and goals.` : ''}

# IMAGE ANALYSIS FOR MARKETING
When users share images, I will analyze them for:
- Brand elements and visual identity assessment
- Marketing potential and opportunities identification
- Content optimization suggestions
- Platform-specific adaptation recommendations
- Visual marketing strategy insights
- Competitive positioning analysis
- Brand consistency evaluation

# INDONESIAN MARKET FOCUS
- Understand local consumer preferences and behaviors
- Consider Indonesian cultural nuances in marketing
- Recommend Indonesia-specific platforms and strategies
- Provide insights on local competition and market dynamics
- Suggest culturally appropriate messaging and campaigns

Remember: I am exclusively focused on digital marketing excellence. Every response should deliver actionable value that helps businesses grow their digital presence and achieve measurable marketing results.`;
  }

  /**
   * Track token usage for AI Assistant (analytics only, no billing impact)
   */
  private async trackTokenUsage(
    userId: string, 
    sessionId: string,
    tokens: { input: number; output: number; total: number }
  ): Promise<void> {
    try {
      // Update session statistics
      await this.prisma.aiAssistantSession.update({
        where: { id: sessionId },
        data: {
          totalInputTokens: { increment: tokens.input },
          totalOutputTokens: { increment: tokens.output },
          totalTokens: { increment: tokens.total },
          lastActivityAt: new Date(),
        }
      });

      // Log for analytics (no billing impact)
      await this.apiLogger.logApiCall({
        endpoint: 'ai-assistant/chat',
        method: 'POST',
        modelUsed: 'gemini-2.5-pro',
        status: 'SUCCESS' as any,
        inputTokens: tokens.input,
        outputTokens: tokens.output,
        totalTokens: tokens.total,
        userId: userId,
        requestSize: 0, // Will be set by caller
        responseSize: 0, // Will be set by caller
      });

    } catch (error) {
      console.error('Failed to track token usage:', error);
      // Don't throw error - tracking failure shouldn't break chat
    }
  }

  /**
   * Upload image to cache with 24h TTL (using existing 'images' bucket)
   */
  private async uploadImageToCache(
    imageBuffer: Buffer,
    originalName: string,
    userId: string
  ): Promise<{ url: string; expiry: Date }> {
    const timestamp = Date.now();
    const fileName = `ai-assistant-cache/${userId}/${timestamp}-${originalName}`;
    const expiry = new Date(timestamp + 24 * 60 * 60 * 1000); // 24 hours

    try {
      // Upload to existing 'images' bucket
      const { data, error } = await this.supabase.storage
        .from('images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/*',
          upsert: false,
        });

      if (error) {
        throw new Error(`Supabase upload error: ${error.message}`);
      }

      // Get public URL
      const { data: publicUrl } = this.supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      // Schedule cleanup after 24h (in production, this should be handled by a cron job)
      setTimeout(() => this.cleanupExpiredImage(fileName), 24 * 60 * 60 * 1000);

      return { url: publicUrl.publicUrl, expiry };
    } catch (error) {
      console.error('Failed to upload image to cache:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Cleanup expired cached image
   */
  private async cleanupExpiredImage(fileName: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from('images')
        .remove([fileName]);
      
      if (error) {
        console.error('Failed to cleanup expired image:', error);
      }
    } catch (error) {
      console.error('Error during image cleanup:', error);
    }
  }

  /**
   * Build business context from user's business information
   */
  private async buildBusinessContext(userId: string): Promise<string | null> {
    try {
      const businessInfo = await this.businessInfoService.findByUserId(userId);
      
      if (!businessInfo) {
        return null;
      }

      let context = `Business: ${businessInfo.businessName}`;
      
      if (businessInfo.description) {
        context += `\nDescription: ${businessInfo.description}`;
      }
      
      if (businessInfo.category) {
        context += `\nCategory: ${businessInfo.category}`;
      }
      
      if (businessInfo.industry) {
        context += `\nIndustry: ${businessInfo.industry}`;
      }
      
      if (businessInfo.businessModel) {
        context += `\nBusiness Model: ${businessInfo.businessModel}`;
      }
      
      if (businessInfo.targetAudience) {
        context += `\nTarget Audience: ${businessInfo.targetAudience}`;
      }
      
      if (businessInfo.brandVoice) {
        context += `\nBrand Voice: ${businessInfo.brandVoice}`;
      }
      
      if (businessInfo.businessGoals && Array.isArray(businessInfo.businessGoals)) {
        context += `\nBusiness Goals: ${(businessInfo.businessGoals as string[]).join(', ')}`;
      }
      
      if (businessInfo.marketingFocus && Array.isArray(businessInfo.marketingFocus)) {
        context += `\nMarketing Focus: ${(businessInfo.marketingFocus as string[]).join(', ')}`;
      }

      return context;
    } catch (error) {
      console.error('Error building business context:', error);
      return null;
    }
  }

  /**
   * Get or create user's AI Assistant session
   */
  async getOrCreateSession(userId: string) {
    let session = await this.prisma.aiAssistantSession.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    if (!session) {
      // Create new session for user
      session = await this.prisma.aiAssistantSession.create({
        data: {
          userId,
        },
        include: {
          _count: {
            select: { messages: true }
          }
        }
      });
    }

    return {
      success: true,
      data: session,
    };
  }

  /**
   * Send message to AI Assistant (main chat functionality)
   */
  async sendMessage(
    userId: string,
    dto: SendMessageDto,
    imageFile?: Express.Multer.File
  ) {
    const startTime = Date.now();

    try {
      // Get or create session
      const sessionResponse = await this.getOrCreateSession(userId);
      const session = sessionResponse.data;

      let imageUrl: string | null = null;
      let imageExpiry: Date | null = null;
      let imageName: string | null = null;

      // Handle image upload if provided
      if (imageFile) {
        const imageResult = await this.uploadImageToCache(
          imageFile.buffer,
          imageFile.originalname,
          userId
        );
        imageUrl = imageResult.url;
        imageExpiry = imageResult.expiry;
        imageName = imageFile.originalname;
      }

      // Save user message
      const userMessage = await this.prisma.aiAssistantMessage.create({
        data: {
          sessionId: session.id,
          role: 'USER',
          content: dto.content,
          imageUrl,
          imageName,
          imageExpiry,
        }
      });

      // Get user's global context
      let globalContext = session.globalContext;
      
      // Fallback to business info if no global context
      if (!globalContext) {
        globalContext = await this.buildBusinessContext(userId);
      }

      // Get recent conversation history (last 10 messages for context)
      const recentMessages = await this.prisma.aiAssistantMessage.findMany({
        where: { 
          sessionId: session.id,
          isDeleted: false,
          id: { not: userMessage.id } // Exclude current message
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Build conversation context
      let conversationHistory = '';
      if (recentMessages.length > 0) {
        conversationHistory = '\n\n# CONVERSATION HISTORY\n';
        recentMessages.reverse().forEach(msg => {
          conversationHistory += `${msg.role}: ${msg.content}\n`;
        });
        conversationHistory += '\n';
      }

      // Create full prompt with system instructions, context, and user message
      const systemPrompt = this.createSystemPrompt(globalContext || undefined);
      const fullPrompt = `${systemPrompt}${conversationHistory}

# CURRENT USER MESSAGE
USER: ${dto.content}

Respond as NusantaraX AI with expert digital marketing advice. If an image was shared, analyze it for marketing opportunities and brand insights.`;

      // Prepare image data for Gemini if provided
      let imagePart: { inlineData: { data: string; mimeType: string; } } | null = null;
      if (imageFile) {
        imagePart = {
          inlineData: {
            data: imageFile.buffer.toString('base64'),
            mimeType: imageFile.mimetype
          }
        };
      }

      // Generate AI response using Gemini 2.5 Pro
      const aiResponse = await this.geminiService.generateContent(
        fullPrompt,
        imagePart,
        'gemini-2.5-pro',
        userId
      );

      const processingTime = Date.now() - startTime;

      // Estimate token usage
      const inputTokens = this.estimateTokens(fullPrompt);
      const outputTokens = this.estimateTokens(aiResponse);
      const totalTokens = inputTokens + outputTokens;

      // Save AI response message
      const assistantMessage = await this.prisma.aiAssistantMessage.create({
        data: {
          sessionId: session.id,
          role: 'ASSISTANT',
          content: aiResponse,
          modelUsed: 'gemini-2.5-pro',
          processingTime,
          inputTokens,
          outputTokens,
          totalTokens,
        }
      });

      // Update session statistics
      await this.prisma.aiAssistantSession.update({
        where: { id: session.id },
        data: {
          totalMessages: { increment: 2 }, // User + Assistant message
          lastActivityAt: new Date(),
        }
      });

      // Track token usage (analytics only)
      await this.trackTokenUsage(userId, session.id, {
        input: inputTokens,
        output: outputTokens,
        total: totalTokens
      });

      return {
        success: true,
        message: 'Message sent successfully',
        data: {
          id: assistantMessage.id,
          role: assistantMessage.role,
          content: assistantMessage.content,
          response: assistantMessage.content, // Add response alias for compatibility
          processingTime: assistantMessage.processingTime,
          inputTokens: assistantMessage.inputTokens,
          outputTokens: assistantMessage.outputTokens,
          totalTokens: assistantMessage.totalTokens,
          createdAt: assistantMessage.createdAt,
        }
      };

    } catch (error) {
      console.error('AI Assistant message failed:', error);
      
      // Log failed API call
      await this.apiLogger.logApiCall({
        endpoint: 'ai-assistant/chat',
        method: 'POST',
        modelUsed: 'gemini-2.5-pro',
        status: 'FAILED' as any,
        responseTime: Date.now() - startTime,
        errorMessage: error.message,
        errorCode: error.code || 'UNKNOWN',
        userId: userId,
      });

      throw new BadRequestException(`AI Assistant error: ${error.message}`);
    }
  }

  /**
   * Get chat messages with pagination
   */
  async getMessages(userId: string, query: GetMessagesQueryDto) {
    const { page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    // Get user's session
    const session = await this.prisma.aiAssistantSession.findUnique({
      where: { userId }
    });

    if (!session) {
      return {
        success: true,
        data: {
          messages: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          }
        }
      };
    }

    // Get messages with pagination
    const [messages, total] = await Promise.all([
      this.prisma.aiAssistantMessage.findMany({
        where: { 
          sessionId: session.id,
          isDeleted: false,
        },
        orderBy: { createdAt: 'asc' }, // Chronological order for chat
        skip: offset,
        take: limit,
      }),
      this.prisma.aiAssistantMessage.count({
        where: { 
          sessionId: session.id,
          isDeleted: false,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        }
      }
    };
  }

  /**
   * Update user's global context configuration
   */
  async updateContext(userId: string, dto: UpdateContextDto) {
    try {
      // Get or create session
      const sessionResponse = await this.getOrCreateSession(userId);
      const session = sessionResponse.data;

      // Update context
      const updatedSession = await this.prisma.aiAssistantSession.update({
        where: { id: session.id },
        data: {
          globalContext: dto.globalContext || null,
          lastContextUpdate: new Date(),
        }
      });

      return {
        success: true,
        message: 'Context updated successfully',
        data: {
          globalContext: updatedSession.globalContext,
          lastContextUpdate: updatedSession.lastContextUpdate,
        }
      };
    } catch (error) {
      console.error('Failed to update context:', error);
      throw new BadRequestException(`Failed to update context: ${error.message}`);
    }
  }

  /**
   * Get user's current context
   */
  async getContext(userId: string) {
    try {
      const session = await this.prisma.aiAssistantSession.findUnique({
        where: { userId }
      });

      return {
        success: true,
        data: {
          globalContext: session?.globalContext || null,
          lastContextUpdate: session?.lastContextUpdate || null,
        }
      };
    } catch (error) {
      console.error('Failed to get context:', error);
      throw new BadRequestException(`Failed to get context: ${error.message}`);
    }
  }

  /**
   * Get user's AI Assistant usage statistics
   */
  async getUsageStats(userId: string) {
    try {
      const session = await this.prisma.aiAssistantSession.findUnique({
        where: { userId },
        include: {
          _count: {
            select: { messages: true }
          }
        }
      });

      if (!session) {
        return {
          success: true,
          data: {
            totalMessages: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalTokens: 0,
            averageTokensPerMessage: 0,
            createdAt: null,
            lastActivityAt: null,
          }
        };
      }

      const averageTokensPerMessage = session.totalMessages > 0 
        ? Math.round(session.totalTokens / session.totalMessages) 
        : 0;

      return {
        success: true,
        data: {
          totalMessages: session.totalMessages,
          totalInputTokens: session.totalInputTokens,
          totalOutputTokens: session.totalOutputTokens,
          totalTokens: session.totalTokens,
          averageTokensPerMessage,
          createdAt: session.createdAt,
          lastActivityAt: session.lastActivityAt,
        }
      };
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      throw new BadRequestException(`Failed to get usage stats: ${error.message}`);
    }
  }

  /**
   * Clear user's chat session (delete all messages)
   */
  async clearSession(userId: string) {
    try {
      const session = await this.prisma.aiAssistantSession.findUnique({
        where: { userId }
      });

      if (!session) {
        return {
          success: true,
          message: 'No session to clear',
        };
      }

      // Soft delete all messages
      await this.prisma.aiAssistantMessage.updateMany({
        where: { sessionId: session.id },
        data: { isDeleted: true }
      });

      // Reset session counters
      await this.prisma.aiAssistantSession.update({
        where: { id: session.id },
        data: {
          totalMessages: 0,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          totalTokens: 0,
          lastActivityAt: new Date(),
        }
      });

      return {
        success: true,
        message: 'Chat session cleared successfully',
      };
    } catch (error) {
      console.error('Failed to clear session:', error);
      throw new BadRequestException(`Failed to clear session: ${error.message}`);
    }
  }

  /**
   * Delete a specific message
   */
  async deleteMessage(userId: string, messageId: string) {
    try {
      // Find message and verify ownership
      const message = await this.prisma.aiAssistantMessage.findFirst({
        where: {
          id: messageId,
          session: { userId }
        },
        include: { session: true }
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      // Soft delete the message
      await this.prisma.aiAssistantMessage.update({
        where: { id: messageId },
        data: { isDeleted: true }
      });

      return {
        success: true,
        message: 'Message deleted successfully',
      };
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error instanceof NotFoundException ? error : 
        new BadRequestException(`Failed to delete message: ${error.message}`);
    }
  }

  /**
   * Helper method to estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
}