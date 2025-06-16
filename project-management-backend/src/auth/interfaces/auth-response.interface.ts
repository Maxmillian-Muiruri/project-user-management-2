export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginResponse extends AuthResponse {
  lastLoginAt: Date;
  loginMethod: 'email' | 'oauth';
}

export interface RegisterResponse extends AuthResponse {
  isEmailVerified: boolean;
  welcomeEmailSent: boolean;
}
