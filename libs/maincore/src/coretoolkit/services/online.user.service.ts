import { Injectable, Logger } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisConnection } from '../adapters/redis.adapter';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

type ConnectionType = 'user' | 'micro';
type ConnectionId = `${ConnectionType}:${string}`;

@Injectable()
export class UserPresenceService {
  server: Server;
  mainServer: Server;

  private readonly logger = new Logger(UserPresenceService.name);
  private client: ReturnType<typeof createClient>;
  private subClient: ReturnType<typeof createClient>;

  constructor(private redisConnection: RedisConnection) {}

  async initialize() {
    this.client = this.redisConnection.getClient();
    this.subClient = this.redisConnection.getSubClient();
    await this.client.configSet('notify-keyspace-events', 'Ex');
    await this.subClient.subscribe('__keyevent@0__:expired', async (key) => {
      if (key) {
        await this.handleSocketExpire(key);
      }
    });
  }

  private async HandleUserOnlineStatus(userId: string) {
    const remainingSockets = await this.client.sCard(`user:${userId}:sockets`);
    const status = remainingSockets === 0 ? 'offline' : 'online';
    await this.client.publish(
      'connection_status',
      JSON.stringify({
        connectionId: userId,
        type: 'user',
        status,
        timestamp: Date.now(),
      }),
    );
    if (status === 'offline') {
      await this.client.sRem(`users_online`, `user:${userId}`);
    }
  }

  private async handleSocketExpire(expiredKey: string) {
    if (
      expiredKey.startsWith('socket:') &&
      expiredKey.endsWith(':socket_expire')
    ) {
      const prefix = expiredKey.replace(':sockets_expire', '');
      const [_, socketId, userId] = prefix.split(':');
      const serverSockets = this.server.sockets as unknown as Map<
        string,
        Socket
      >;
      const socket = serverSockets.get(socketId);
      if (!socket) {
        await this.client.hDel('socket_to_connection', socketId);
        await this.client.sRem(`user:${userId}:sockets`, socketId);
        await this.HandleUserOnlineStatus(userId);
      } else {
        // ping the socket
        const now = Date.now();
        const timeout = setTimeout(async () => {
          this.logger.warn(`Socket ${socketId} did not respond to ping.`);
          this.client.hDel('socket_to_connection', socketId);
          this.client.sRem(`user:${userId}:sockets`, socketId);
          await this.HandleUserOnlineStatus(userId);
          socket.disconnect(true);
        }, 5000);
        socket.emit('custom-ping', { timestamp: now });
        socket.once('custom-pong', (data) => {
          clearTimeout(timeout);
          this.client.set(expiredKey, socketId, {
            EX: 60,
          });
        });
      }
    }
  }

  async connectionEstablished(
    connectionId: string,
    socketId: string,
  ): Promise<void> {
    const { type, id } = this.parseConnectionId(connectionId);

    try {
      // Validate inputs
      if (!connectionId || !socketId || !type || !id) {
        throw new Error('Invalid connection parameters');
      }

      // Create transaction
      const multi = this.client.multi();

      // Set socket to connection mapping (24h TTL)
      multi.hSet('socket_to_connection', socketId, connectionId);
      multi.expire('socket_to_connection', 86400);

      // Track socket in connection sets
      multi.sAdd(`${type}:${id}:sockets`, socketId);

      // Track socket expiration
      multi.sAdd(`socket:${socketId}:${id}:socket_expire`, socketId);
      multi.expire(`socket:${socketId}:${id}:socket_expire`, 120);

      // Add to online set
      multi.sAdd(`${type}s_online`, connectionId);

      // Execute transaction
      const results = await multi.exec();

      // Verify all commands succeeded
      if (results.some((result) => result[0])) {
        const errorIndex = results.findIndex((result) => result[0]);
        throw new Error(`Redis command ${errorIndex} failed`);
      }

      // Publish connection status
      await this.client.publish(
        'connection_status',
        JSON.stringify({
          connectionId,
          type,
          status: 'online',
          socketId,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      this.logger.error(`Connection tracking failed for ${socketId}`, error);
      throw error;
    }
  }

  private parseConnectionId(id: string): { type: ConnectionType; id: string } {
    const [type, ...rest] = id.split(':');
    if (type !== 'user' && type !== 'micro') {
      throw new Error(`Invalid connection ID format: ${id}`);
    }
    return { type, id: rest.join(':') };
  }

  async connectionTerminated(socketId: string) {
    const connectionId = (await this.client.hGet(
      'socket_to_connection',
      socketId,
    )) as string;

    if (!connectionId) return null;

    const { type, id } = this.parseConnectionId(connectionId);

    const multi = this.client.multi();
    multi.hDel('socket_to_connection', socketId);
    multi.sRem(`${type}:${id}:sockets`, socketId);
    multi.del(`socket:${socketId}:${id}:socket_expire`);

    await multi.exec();
    this.HandleUserOnlineStatus(id);
    return connectionId;
  }

  async getOnlineUsers() {
    return await this.client.sMembers('users_online');
  }

  async getOnlineMicroservices() {
    return await this.client.sMembers('micros_online');
  }

  async isUserOnline(userId: string) {
    return await this.client.sIsMember('users_online', `user:${userId}`);
  }

  async isMicroserviceOnline(serviceName: string) {
    return await this.client.sIsMember('micros_online', `micro:${serviceName}`);
  }

  async getConnectionSockets(connectionId: string) {
    const { type, id } = this.parseConnectionId(connectionId);
    return await this.client.sMembers(`${type}:${id}:sockets`);
  }

  async getUserSockets(userId: string) {
    const connectionId = `user:${userId}:sockets`;
    const sockets = (await this.client.sMembers(connectionId)) as string[];
    if (!sockets) return [];
    const serverSockets = this.server.sockets as unknown as Map<string, Socket>;
    return sockets?.map((socketId) => serverSockets.get(socketId));
  }

  async getSocket(socketId: string) {
    const socket = await this.client.hGet('socket_to_connection', socketId);
    return socket;
  }

  async getAllConnections() {
    return await this.client.hGetAll('socket_to_connection');
  }

  async clearOnline() {
    await this.client.del('users_online');
    await this.client.del('micros_online');
    await this.client.del('socket_to_connection');
    await this.client.del('micro:notiification:sockets');
    await this.client.del('micro:upload:sockets');
  }

  async clearAllConnections() {
    const patterns = ['*:sockets', 'socket:*:socket_expire', 'micro:*:sockets'];

    const fixedKeys = ['users_online', 'micros_online', 'socket_to_connection'];

    const batchSize = 100;
    for (const pattern of patterns) {
      let cursor = '0';
      do {
        const reply = await this.client.scan(cursor, {
          MATCH: pattern,
          COUNT: batchSize,
        });
        cursor = reply.cursor as string;
        const keys = reply.keys;

        if (keys.length > 0) {
          await this.client.del(keys);
        }
      } while (cursor !== '0');
    }

    // Delete fixed keys
    await this.client.del(fixedKeys);

    if (this.server) {
      const sockets = await this.server.fetchSockets();

      // First emit logout event to all sockets
      sockets.forEach((socket) => {
        socket.emit('force_logout', {
          reason: 'System reset',
          message: 'All connections are being reset by the system',
        });
      });

      setTimeout(() => {
        sockets.forEach((socket) => {
          socket.disconnect(true);
        });
        this.logger.log(`Notified and disconnected ${sockets.length} sockets`);
      }, 500);

      await this.client.publish(
        'system_events',
        JSON.stringify({
          type: 'connections_reset',
          timestamp: Date.now(),
          disconnectedSockets: sockets.length,
        }),
      );
    } else {
      this.logger.log(
        'Cleared all connection data (no server instance to disconnect sockets)',
      );
    }

    // Publish offline status for all users
    const onlineUsers = (await this.client.keys('user:*:sockets')) as string[];
    for (const userKey of onlineUsers) {
      const userId = userKey.replace('user:', '').replace(':sockets', '');
      await this.client.publish(
        'connection_status',
        JSON.stringify({
          connectionId: `user:${userId}`,
          type: 'user',
          status: 'offline',
          reason: 'system_reset',
          timestamp: Date.now(),
        }),
      );
    }
  }
}
