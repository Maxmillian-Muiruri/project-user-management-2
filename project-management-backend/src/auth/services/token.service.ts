import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { AuthResponse } from '../interfaces/auth-response.interface';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET');
    this.logger.debug(`JWT_SECRET: ${jwtSecret ? '[SET]' : '[NOT SET]'}`);
    this.logger.debug(
      `JWT_REFRESH_SECRET: ${jwtRefreshSecret ? '[SET]' : '[NOT SET]'}`,
    );
  }

  generateTokens(user: {
    id: string;
    email: string;
    role: string;
  }): AuthResponse {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessTokenExpiry = this.configService.get<string>(
      'JWT_EXPIRES_IN',
      '15m',
    );
    const refreshTokenExpiry = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiry,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpiry,
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        this.configService.get<string>('JWT_SECRET'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiryToSeconds(accessTokenExpiry),
      tokenType: 'Bearer',
    };
  }

  generateAccessToken(user: {
    id: string;
    email: string;
    role: string;
  }): Omit<AuthResponse, 'refreshToken'> {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessTokenExpiry = this.configService.get<string>(
      'JWT_EXPIRES_IN',
      '15m',
    );

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiry,
    });

    return {
      accessToken,
      expiresIn: this.parseExpiryToSeconds(accessTokenExpiry),
      tokenType: 'Bearer',
    };
  }

  verifyToken(token: string): TokenPayload {
    return this.jwtService.verify(token);
  }

  verifyRefreshToken(token: string): TokenPayload {
    return this.jwtService.verify(token, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        this.configService.get<string>('JWT_SECRET'),
    });
  }

  private parseExpiryToSeconds(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 900; // 15 minutes default
    }
  }
}
