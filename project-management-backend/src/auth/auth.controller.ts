/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponse } from './interfaces/auth-response.interface';
import { TokenPayload } from './interfaces/token-payload.interface';

@Controller('auth')
@UseGuards(JwtAuthGuard) // Apply JWT guard globally to this controller
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: TokenPayload,
    @Body() body: { refreshToken: string },
  ): Promise<{ message: string }> {
    await this.authService.logout(user.sub, body.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() user: TokenPayload,
  ): Promise<{ message: string }> {
    await this.authService.logoutAll(user.sub);
    return { message: 'Logged out from all devices successfully' };
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: TokenPayload): Promise<TokenPayload> {
    return user;
  }

  @Get('me')
  async getCurrentUser(@CurrentUser() user: TokenPayload) {
    const userData = await this.authService.getUserById(user.sub);
    return userData;
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin-only')
  async adminOnly(
    @CurrentUser() user: TokenPayload,
  ): Promise<{ message: string; user: TokenPayload }> {
    return {
      message: 'This is an admin-only endpoint',
      user,
    };
  }

  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN')
  @Get('protected')
  async protectedRoute(
    @CurrentUser() user: TokenPayload,
  ): Promise<{ message: string; user: TokenPayload }> {
    return {
      message: 'This is a protected endpoint',
      user,
    };
  }

  // Health check endpoint
  @Public()
  @Get('health')
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}
