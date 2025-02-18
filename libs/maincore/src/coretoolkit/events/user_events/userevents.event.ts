import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
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
  ) {}

  @SubscribeMessage(USER_EVENTS.LOGOUT)
  handleLogout(@MessageBody() data: { userId: string }) {
    return this.authService.handleLogout(data);
  }

  @SubscribeMessage(USER_EVENTS.UPDATE_SESSION)
  HandleUpdateUserSession(@MessageBody() data: { userId: string }) {
    return this.jwtService.HandleUpdateUserSession(data);
  }

  @SubscribeMessage(USER_EVENTS.FETCH_MODULES)
  handleFetchModules(@MessageBody() data: any) {
    return this.authService.handleFetchModules(data);
  }

  @SubscribeMessage(USER_EVENTS.USER_OFFLINE)
  HandleUserOffline(@MessageBody() data: { userId: string; manual?: boolean }) {
    return this.authService.HandleUserOffline(data);
  }

  @SubscribeMessage(NOTIFICATION_PATTERN.LOGIN)
  HandleLogin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    return this.authService.HandleLogin(data, client);
  }

  @SubscribeMessage(USER_EVENTS.IS_LOGGED_IN)
  async HandleIsLoggedIn(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    return this.authService.HandleIsLoggedIn(data, client);
  }

  @SubscribeMessage(USER_EVENTS.GET_ONLINE_USERS)
  handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    const onlineUsers = Array.from(this.events.getClients().keys());
    client.emit(USER_EVENTS.ONLINE_USERS, onlineUsers);
  }

  @SubscribeMessage(USER_EVENTS.PROFILE_UPLOAD)
  async HandleUploadProfilePicture(@MessageBody() data: UploadReturn) {
    await this.uploadservice.HandleUploadProfilePicture(data);
  }

  @SubscribeMessage('upload_error')
  handleUpload(@MessageBody() data: UploadErrorType) {
    return this.uploadservice.handleUpload(data);
  }
  @SubscribeMessage('upload_progress')
  handleUploadProgress(@MessageBody() data: UploadProgressType) {
    return this.uploadservice.handleUploadProgress(data);
  }
}
