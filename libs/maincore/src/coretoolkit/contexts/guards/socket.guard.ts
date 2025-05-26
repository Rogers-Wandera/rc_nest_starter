// src/socket/socket.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

export class AuthenticatedSocketAdapter extends IoAdapter {
  constructor(
    private readonly app: any,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: any): any {
    const server: Server = super.createIOServer(port, {
      ...options,
      pingInterval: 25000, // 25 seconds
      pingTimeout: 60000, // 60 seconds
    });

    server.use((socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const validToken = this.configService.get<string>('SOCKET_TOKEN');

        if (!token || token !== validToken) {
          throw new Error('Invalid Auth token');
        }
        next();
      } catch (error) {
        next(error);
      }
    });

    return server;
  }
}
