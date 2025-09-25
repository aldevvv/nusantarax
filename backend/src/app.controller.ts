import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/database')
  async getDatabaseHealth(): Promise<{ status: string; connected: boolean }> {
    const isConnected = await this.prismaService.healthCheck();
    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      connected: isConnected
    };
  }
}
