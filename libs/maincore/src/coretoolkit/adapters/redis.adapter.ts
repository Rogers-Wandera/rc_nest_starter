import { Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

export class RedisConnection {
  private readonly logger = new Logger(RedisConnection.name);
  public isInitialized: boolean = false;
  private redisClient: ReturnType<typeof createClient>;
  private subClient: ReturnType<typeof createClient>;

  async connectToRedis() {
    try {
      const pubClient = createClient({
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT),
          reconnectStrategy: (retries) => {
            this.logger.warn(`Redis reconnection attempt ${retries}`);
            return Math.min(retries * 100, 5000);
          },
        },
      });
      const subClient = pubClient.duplicate();
      pubClient.on('error', (err) =>
        this.logger.error('Redis Pub Client Error:', err),
      );
      subClient.on('error', (err) =>
        this.logger.error('Redis Sub Client Error:', err),
      );

      await Promise.all([
        pubClient.connect().then(() => this.logger.log('PubClient connected')),
        subClient.connect().then(() => this.logger.log('SubClient connected')),
      ]);

      this.redisClient = pubClient;
      this.subClient = subClient;
      this.isInitialized = true;

      this.logger.log('Redis adapter initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Redis adapter:', error);
      throw error;
    }
  }

  getClient(): ReturnType<typeof createClient> {
    if (!this.isInitialized) {
      throw new Error('Redis not initialized');
    }
    return this.redisClient;
  }

  getSubClient(): ReturnType<typeof createClient> {
    if (!this.isInitialized) {
      throw new Error('Redis not initialized');
    }
    return this.subClient;
  }
}
