import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { WalletService } from './wallet.service';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

class AddFundsDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER, Role.ADMIN)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('health')
  getHealth() {
    return {
      success: true,
      message: 'Wallet service is running',
      timestamp: new Date().toISOString()
    };
  }

  @Get()
  async getWallet(@Request() req) {
    try {
      const wallet = await this.walletService.getWallet(req.user.id);
      
      return {
        success: true,
        data: wallet,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch wallet',
        error: error.message,
      };
    }
  }

  @Get('stats')
  async getWalletStats(@Request() req) {
    try {
      const stats = await this.walletService.getWalletStats(req.user.id);
      
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch wallet statistics',
        error: error.message,
      };
    }
  }

  @Get('transactions')
  async getWalletTransactions(
    @Request() req,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    try {
      const transactions = await this.walletService.getWalletTransactions(
        req.user.id,
        limit,
        offset,
      );
      
      return {
        success: true,
        data: transactions,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch wallet transactions',
        error: error.message,
      };
    }
  }

  @Post('add-funds')
  @Roles(Role.ADMIN) // Only admin can manually add funds for now
  async addFunds(@Body() addFundsDto: AddFundsDto, @Request() req) {
    try {
      const result = await this.walletService.addFunds(
        req.user.id,
        addFundsDto.amount,
        addFundsDto.description,
        req.user.id, // Admin who processed the request
      );
      
      return {
        success: true,
        message: 'Funds added successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to add funds',
        error: error.message,
      };
    }
  }

  // Admin-only endpoints for managing all wallets
  @Get('admin/all')
  @Roles(Role.ADMIN)
  async getAllWallets(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    try {
      const result = await this.walletService.getAllWallets(page, limit, search);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch wallets',
        error: error.message,
      };
    }
  }

  @Post('admin/add-funds/:userId')
  @Roles(Role.ADMIN)
  async adminAddFunds(
    @Param('userId') userId: string,
    @Body() body: AddFundsDto,
    @Request() req,
  ) {
    try {
      const result = await this.walletService.addFunds(
        userId,
        body.amount,
        body.description,
        req.user.id, // Admin who processed the request
      );
      
      return {
        success: true,
        message: 'Funds added successfully by admin',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to add funds',
        error: error.message,
      };
    }
  }

  @Post('admin/deduct-funds/:userId')
  @Roles(Role.ADMIN)
  async adminDeductFunds(
    @Param('userId') userId: string,
    @Body() body: { amount: number; description: string },
  ) {
    try {
      const result = await this.walletService.deductFunds(
        userId,
        body.amount,
        body.description,
      );
      
      return {
        success: true,
        message: 'Funds deducted successfully by admin',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to deduct funds',
        error: error.message,
      };
    }
  }

  @Get('admin/user/:userId')
  @Roles(Role.ADMIN)
  async getUserWallet(@Param('userId') userId: string) {
    try {
      const wallet = await this.walletService.getWallet(userId);
      return {
        success: true,
        data: wallet,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch user wallet',
        error: error.message,
      };
    }
  }

  @Get('admin/user/:userId/transactions')
  @Roles(Role.ADMIN)
  async getUserTransactions(
    @Param('userId') userId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    try {
      const result = await this.walletService.getWalletTransactions(userId, limit, offset);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch user transactions',
        error: error.message,
      };
    }
  }
}
