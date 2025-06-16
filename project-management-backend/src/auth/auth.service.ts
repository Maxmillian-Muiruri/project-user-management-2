import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { AuthResponse } from './interfaces/auth-response.interface';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

// Export User type for other modules
export { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    private sessionService: SessionService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, role = 'USER', name } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as any, // Cast to match your Role enum
        isActive: true,
        name,
      },
    });

    // Generate tokens
    const tokens = this.tokenService.generateTokens({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Create session
    await this.sessionService.createSession(
      newUser.id,
      tokens.refreshToken as string,
    );
    return tokens;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Validate user
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.tokenService.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Create session
    await this.sessionService.createSession(
      user.id,
      tokens.refreshToken as string,
    );

    return tokens;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.tokenService.verifyRefreshToken(refreshToken);

      // Validate session
      const isValidSession = await this.sessionService.validateRefreshToken(
        payload.sub,
        refreshToken,
      );

      if (!isValidSession) {
        throw new UnauthorizedException('Invalid refresh token session');
      }

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new tokens
      const tokens = this.tokenService.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Revoke old refresh token and create new session
      await this.sessionService.revokeRefreshToken(user.id, refreshToken);
      await this.sessionService.createSession(
        user.id,
        tokens.refreshToken as string,
      );

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.sessionService.revokeRefreshToken(userId, refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionService.revokeAllUserSessions(userId);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async validateRefreshToken(
    userId: string,
    tokenIssuedAt?: Date,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      return false;
    }

    // Additional validation logic can be added here
    // For example, check if token was issued before password change
    return true;
  }

  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password field
      },
    });

    return user;
  }
}
