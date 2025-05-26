import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventsGateway } from '../event.gateway';
import { NOTIFICATION_PATTERN, USER_EVENTS } from '../../types/enums/enums';
import { corsOptions } from '../../config/corsoptions';
import { UploadReturn } from '../../micro/fileuploads/upload.type';
import { USER_JWT_EVENTS } from './jwt.eventsservice';
import {
  UploadErrorType,
  UploadEvents,
  UploadProgressType,
} from '../upload/upload.event';
import { UserAuthService } from './auth.eventservice';
import { UserSessionService } from '../../services/session.user.service';

@Injectable()
@WebSocketGateway({
  cors: corsOptions,
})
export class UserEventsService {
  constructor(
    private readonly events: EventsGateway,
    private readonly jwtService: USER_JWT_EVENTS,
    private uploadservice: UploadEvents,
    private authService: UserAuthService,
    private readonly userSession: UserSessionService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage(USER_EVENTS.FETCH_MODULES)
  handleFetchModules(
    @MessageBody()
    data: {
      userId?: string;
      groupId?: number;
      name: string;
      infotype: string;
    },
  ) {
    // return this.authService.handleFetchModules(data);
  }

  @SubscribeMessage(USER_EVENTS.USER_OFFLINE)
  HandleUserOffline(@MessageBody() data: { userId: string; manual?: boolean }) {
    // return this.authService.HandleUserOffline(data);
  }

  @SubscribeMessage(USER_EVENTS.LOGIN)
  async HandleLogin(
    @MessageBody() data: { userId: string; token: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sessionId = await this.userSession.storeSession(
      data.userId,
      data.token,
    );
    await this.authService.HandleLogin({ userId: data.userId, sessionId });
    return { sessionId };
  }

  @SubscribeMessage(USER_EVENTS.IS_LOGGED_IN)
  async HandleIsLoggedIn(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // return this.authService.HandleIsLoggedIn(data, client);
  }

  // @SubscribeMessage(USER_EVENTS.GET_ONLINE_USERS)
  // handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
  //   const onlineUsers = Array.from(this.events.getClients().keys());
  //   client.emit(USER_EVENTS.ONLINE_USERS, onlineUsers);
  // }

  @SubscribeMessage(USER_EVENTS.PROFILE_UPLOAD)
  async HandleUploadProfilePicture(@MessageBody() data: UploadReturn) {
    await this.uploadservice.HandleUploadProfilePicture(data);
  }

  @SubscribeMessage('upload_error')
  handleUpload(@MessageBody() data: UploadErrorType) {
    // return this.uploadservice.handleUpload(data);
  }
  @SubscribeMessage('upload_progress')
  handleUploadProgress(@MessageBody() data: UploadProgressType) {
    // return this.uploadservice.handleUploadProgress(data);
  }
}
