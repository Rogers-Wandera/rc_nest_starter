import { Injectable, Logger } from '@nestjs/common';
import { RedisConnection } from '../adapters/redis.adapter';
import { JwtService } from '@nestjs/jwt';
import { createClient } from 'redis';
import { UserPresenceService } from './online.user.service';
import { v4 as uuid } from 'uuid';
import { Server } from 'socket.io';

@Injectable()
export class UserSessionService {
  private client: ReturnType<typeof createClient>;
  private subClient: ReturnType<typeof createClient>;
  private logger = new Logger(UserSessionService.name);
  mainServer: Server;
  server: Server;
  constructor(
    private redisConnection: RedisConnection,
    private jwtService: JwtService,
    private userPresence: UserPresenceService,
  ) {}

  async initialize() {
    this.client = this.redisConnection.getClient();
    this.subClient = this.redisConnection.getSubClient();
    await this.subClient.subscribe('__keyevent@0__:expired', async (key) => {
      if (key) {
        this.handleKeyExpiration(key).catch((err) => {
          this.logger.error(
            `Error handling expired key ${key}: ${err.message}`,
          );
        });
      }
    });
  }

  public async storeSession(
    userId: string,
    token: string,
    sessionId?: string | null,
  ) {
    const decoded = await this.jwtService.decode(token);
    if (!decoded?.exp) throw new Error('Invalid token: missing expiration');
    const expiresAt = parseInt(decoded.exp);
    const currentTime = Math.floor(Date.now() / 1000);
    const ttl = expiresAt - currentTime;
    const alertExpiry = expiresAt - 600;
    const finalSessionId = sessionId ?? uuid();

    const sessionKey = `session:${userId}:${finalSessionId}`;
    const alertKey = `session_alert:${userId}:${finalSessionId}`;
    const userSessionsKey = `user_sessions:${userId}`;
    const sessionMetaKey = `session_meta:${userId}:${finalSessionId}`;

    const multi = this.client.multi();

    multi.set(sessionKey, token, { EX: ttl });
    multi.sAdd(userSessionsKey, finalSessionId);
    multi.hSet(sessionMetaKey, { exp: expiresAt });

    if (alertExpiry > 0) {
      const alertTtl = alertExpiry - currentTime;
      if (alertTtl > 0) {
        multi.set(alertKey, '1', { EX: alertTtl });
      }
    }
    await multi.exec();
    return finalSessionId;
  }

  private async handleKeyExpiration(expiredKey: string) {
    if (expiredKey.startsWith('session_alert:')) {
      await this.handleSessionAlert(expiredKey);
    } else if (expiredKey.startsWith('session:')) {
      await this.handleSessionExpire(expiredKey);
    }
  }

  private async handleSessionAlert(expiredKey: string) {
    const [_, userId, sessionId] = expiredKey.split(':');
    const userSockets = await this.userPresence.getUserSockets(userId);
    const sessionMetaKey = `session_meta:${userId}:${sessionId}`;
    const exp = (await this.client.hGet(sessionMetaKey, 'exp')) as string;

    if (!exp) return;
    const expiresAt = parseInt(exp);
    const now = Math.floor(Date.now() / 1000);
    const secondsLeft = expiresAt - now;

    if (userSockets?.length > 0) {
      userSockets.forEach((socket) => {
        socket.emit('session_alert', { sessionId, secondsLeft });
      });
    } else {
      this.emitToSession(sessionId, 'session_alert', {
        sessionId,
        secondsLeft,
      });
    }
  }

  private async handleSessionExpire(expiredKey: string) {
    const [_, userId, sessionId] = expiredKey.split(':');
    const userSessionsKey = `user_sessions:${userId}`;
    const sessionMetaKey = `session_meta:${userId}:${sessionId}`;
    const multi = this.client.multi();
    multi.sRem(userSessionsKey, sessionId);
    multi.del(sessionMetaKey);
    await multi.exec();
    const userSockets = await this.userPresence.getUserSockets(userId);
    if (userSockets?.length > 0) {
      userSockets.forEach((socket) => {
        socket.emit('session_expired', { sessionId });
      });
    } else {
      this.emitToSession(sessionId, 'session_expired', {
        sessionId,
      });
    }
  }

  async removeSession(userId: string, sessionId: string) {
    const userSessionsKey = `user_sessions:${userId}`;
    const sessionKey = `session:${userId}:${sessionId}`;
    const sessionMetaKey = `session_meta:${userId}:${sessionId}`;
    const multi = this.client.multi();
    multi.sRem(userSessionsKey, sessionId);
    multi.del(sessionKey);
    multi.del(`session_alert:${userId}:${sessionId}`);
    multi.del(sessionMetaKey);
    await multi.exec();
  }

  async updateSession(userId: string, sessionId: string, token: string) {
    return this.storeSession(userId, token, sessionId);
  }

  async getUserSessionIds(userId: string): Promise<string[]> {
    const userSessionsKey = `user_sessions:${userId}`;
    return (await this.client.sMembers(userSessionsKey)) as string[];
  }

  async updateAllUserSessions(userId: string, token: string): Promise<void> {
    const sessionIds = await this.getUserSessionIds(userId);
    await Promise.all(
      sessionIds.map((sessionId) =>
        this.storeSession(userId, token, sessionId),
      ),
    );
  }

  async clearAllSessions() {
    const sessionKeys = await this.client.keys('session:*');
    const sessionAlertKeys = await this.client.keys('session_alert:*');
    const userSessionsKeys = await this.client.keys('user_sessions:*');
    const sessionMetaKeys = await this.client.keys('session_meta:*');

    const allKeys = [
      ...sessionKeys,
      ...sessionAlertKeys,
      ...userSessionsKeys,
      ...sessionMetaKeys,
    ];

    if (allKeys.length > 0) {
      const batchSize = 100; // Process 100 keys at a time
      for (let i = 0; i < allKeys.length; i += batchSize) {
        const batch = allKeys.slice(i, i + batchSize);
        await this.client.del(batch);
      }
      this.logger.log(`Cleared ${allKeys.length} session-related keys`);
    } else {
      this.logger.log('No session keys found to clear');
    }
  }

  async emitToSession(sessionId: string, pattern: string, data: any) {
    if (!sessionId) {
      this.logger.warn('Session ID is required to emit to session');
      return false;
    }
    if (this.mainServer.sockets.sockets.size === 0) {
      this.logger.warn('No active sockets found to emit to session');
      return false;
    }
    try {
      // Check if any sockets are in the room (optional optimization)
      const room = this.mainServer.sockets.adapter.rooms.get(sessionId);
      if (!room || room.size === 0) {
        this.logger.warn(`No active sockets found for session ${sessionId}`);
        return false;
      }
      // Emit to the room (all sockets in the room will receive it)
      this.mainServer.to(sessionId).emit(pattern, data);
      this.logger.log(`Emitted "${pattern}" to session ${sessionId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to emit to session ${sessionId}: ${error.message}`,
      );
      return false;
    }
  }
}
