/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';

interface UserSession {
  userId: string;
  refreshToken: string;
  createdAt: Date;
  lastUsed: Date;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class SessionService {
  private sessions: Map<string, UserSession[]> = new Map();

  async createSession(
    userId: string,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<void> {
    const session: UserSession = {
      userId,
      refreshToken,
      createdAt: new Date(),
      lastUsed: new Date(),
      userAgent,
      ipAddress,
    };

    const userSessions = this.sessions.get(userId) || [];
    userSessions.push(session);
    this.sessions.set(userId, userSessions);
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const userSessions = this.sessions.get(userId);
    if (!userSessions) {
      return false;
    }

    const session = userSessions.find((s) => s.refreshToken === refreshToken);
    if (!session) {
      return false;
    }

    // Update last used
    session.lastUsed = new Date();
    return true;
  }

  async revokeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const userSessions = this.sessions.get(userId);
    if (!userSessions) {
      return;
    }

    const filteredSessions = userSessions.filter(
      (s) => s.refreshToken !== refreshToken,
    );
    this.sessions.set(userId, filteredSessions);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    this.sessions.delete(userId);
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return this.sessions.get(userId) || [];
  }

  async cleanExpiredSessions(): Promise<void> {
    const now = new Date();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    for (const [userId, sessions] of this.sessions.entries()) {
      const validSessions = sessions.filter(
        (session) => now.getTime() - session.lastUsed.getTime() < maxAge,
      );

      if (validSessions.length === 0) {
        this.sessions.delete(userId);
      } else {
        this.sessions.set(userId, validSessions);
      }
    }
  }
}
