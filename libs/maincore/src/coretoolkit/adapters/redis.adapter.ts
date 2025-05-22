import { Logger, OnModuleInit } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server, ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter implements OnModuleInit {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private pubClient: Redis;
  private subClient: Redis;
  private isInitialized: boolean = false;
  public redisClient: Redis;

  async onModuleInit() {
    if (!this.isInitialized) {
      await this.connectToRedis();
    }
  }

  async connectToRedis() {
    this.pubClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn(`Retrying Redis connection in ${delay}ms`);
        return delay;
      },
    });

    this.subClient = this.pubClient.duplicate();
    this.pubClient.on('error', (err) => {
      this.logger.error('Redis PubClient error:', err);
    });

    this.subClient.on('error', (err) => {
      this.logger.error('Redis SubClient error:', err);
    });
    this.redisClient = this.pubClient;
    await this.redisClient.ping();
    this.isInitialized = true;
    this.logger.log('Redis adapter initialized');
  }
  createIOServer(port: number, options?: ServerOptions) {
    if (!this.isInitialized) {
      throw new Error('Redis adapter not initialized');
    }
    const server = super.createIOServer(port, options) as Server;
    server.adapter(createAdapter(this.pubClient, this.subClient));
    return server;
  }
}
