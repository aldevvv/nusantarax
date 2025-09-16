import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  HttpStatus,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/auth.types';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, Provider } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('role') roleFilter?: string,
  ) {
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      
      const result = await this.usersService.findAll(pageNum, limitNum, search, roleFilter);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch users');
    }
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  async getUserStats() {
    try {
      const stats = await this.usersService.getUserStats();
      
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch user statistics');
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async getUserById(@Param('id') id: string) {
    try {
      const user = await this.usersService.findById(id);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            emailVerified: user.emailVerified,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user');
    }
  }

  @Post()
  @Roles(Role.ADMIN)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    try {
      const user = await this.usersService.createUserByAdmin({
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        password: createUserDto.password || 'TempPassword123!',
        role: createUserDto.role || Role.USER,
      });

      return {
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
          },
        },
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to create user');
    }
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    try {
      // Prevent admin from downgrading themselves
      if (id === currentUser.id && updateUserDto.role === Role.USER) {
        throw new BadRequestException('You cannot remove your own admin privileges');
      }

      const user = await this.usersService.updateUser(id, updateUserDto);
      
      return {
        success: true,
        message: 'User updated successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            emailVerified: user.emailVerified,
            updatedAt: user.updatedAt,
          },
        },
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to update user');
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    try {
      // Prevent admin from deleting themselves
      if (id === currentUser.id) {
        throw new BadRequestException('You cannot delete your own account');
      }

      await this.usersService.deleteUser(id);
      
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error: any) {
      if (error.message === 'User not found') {
        throw new NotFoundException('User not found');
      }
      throw new BadRequestException(error.message || 'Failed to delete user');
    }
  }
}