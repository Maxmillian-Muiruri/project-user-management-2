import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { TokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  JwtStrategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const options: StrategyOptionsWithoutRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: (() => {
        const secret =
          configService.get<string>('JWT_REFRESH_SECRET') ||
          configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT refresh secret is not defined');
        }
        return secret;
      })(),
      ignoreExpiration: false,
    };

    super(options);
  }
  async validate(payload: TokenPayload): Promise<TokenPayload> {
    // Validate the refresh token payload
    if (!payload?.sub || !payload?.email || !payload?.role) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    try {
      // Optional: Verify the refresh token is still valid in your database

      const isValidRefreshToken = await this.authService?.validateRefreshToken(
        payload.sub,
        payload.iat ? new Date(payload.iat * 1000) : undefined,
      );

      if (!isValidRefreshToken) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      return {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Failed to validate refresh token');
    }
  }
}
