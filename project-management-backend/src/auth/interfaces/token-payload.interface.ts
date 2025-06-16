export interface TokenPayload {
  sub: string; // User ID (subject)
  email: string; // User email
  role: string; // User role (e.g., 'USER', 'ADMIN')
  iat?: number; // Issued at timestamp (auto-added by JWT)
  exp?: number; // Expiration timestamp (auto-added by JWT)
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string; // Only for login/refresh endpoints
  expiresIn: number; // Seconds until expiration
  tokenType?: string; // Usually 'Bearer'
}
