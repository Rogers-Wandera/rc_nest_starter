import { Service } from '@core/maincore/coretoolkit/decorators/param.decorator';
import { ValidateService } from '@core/maincore/coretoolkit/decorators/servicevalidate.decorator';
import { RabbitMQService } from '@core/maincore/coretoolkit/micro/microservices/rabbitmq.service';
import {
  NOTIFICATION_PATTERN,
  RabbitMQQueues,
  ROLE,
} from '@core/maincore/coretoolkit/types/enums/enums';
import { User } from '@core/maincore/entities/core/users.entity';
import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import { IController } from '../../controller.interface';
import { UserService } from '@core/maincore/coreservices/services/auth/users/users.service';
import { AuthGuard } from '@core/maincore/authguards/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { Paginate } from '@core/maincore/coretoolkit/decorators/pagination.decorator';
import { Request } from 'express';
import { EventLogger } from '@core/maincore/coretoolkit/app/utils/event.logger';
import { Notification } from '@core/maincore/coretoolkit/interfaces/notification.interface';
import { Permissions } from '@core/maincore/coretoolkit/decorators/permissions.decorator';
import { Roles } from '@core/maincore/authguards/decorators/roles.guard';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@core/maincore/coretoolkit/config/config';
import { catchError, lastValueFrom } from 'rxjs';
import { Timeout } from '@core/maincore/coretoolkit/decorators/timeout.decorator';

@Controller('/core/notifications')
@AuthGuard(ROLE.ADMIN)
@ApiTags('Notifications')
export class NotificationController extends IController<UserService> {
  private baseUrl: string;
  constructor(
    private readonly rabbitClient: RabbitMQService,
    model: UserService,
    private readonly eventslogger: EventLogger,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {
    super(model);
    this.baseUrl = this.configService.get('baseNotificationUrl');
  }

  @Get('/:userId')
  @ValidateService({ entity: User })
  @Paginate()
  @Roles(ROLE.USER)
  @Timeout(30000)
  async getNotifications(@Service('user') user: User, @Req() req: Request) {
    try {
      const url = `${this.baseUrl}/recipient`;
      const response = await this.httpService.axiosRef.get(url, {
        params: {
          ...req.parsedQuery,
          userId: user.id,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  @Get('/main/data/:userId')
  @Paginate()
  @ValidateService({ entity: User })
  @Permissions({ module: 'Notifications', moduleLink: 'Manage Notifications' })
  async getMainNotifications(@Req() req: Request, @Service('user') user: User) {
    try {
      const url = `${this.baseUrl}/recipient/main`;
      const response = await this.httpService.axiosRef.get(url, {
        params: {
          ...req.parsedQuery,
          userId: user.id,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  @Patch('/:userId')
  @ValidateService({ entity: User })
  @Roles(ROLE.USER)
  updateNotification(
    @Body() data: { readItems: string[] },
    @Req() req: Request,
  ) {
    try {
      this.rabbitClient.setQueue(RabbitMQQueues.NOTIFICATIONS);
      this.rabbitClient.emit(NOTIFICATION_PATTERN.UPDATE_READ, {
        readItems: data.readItems,
        readBy: req.user.displayName,
        userId: req.user.id,
      });
      this.eventslogger.logEvent(`User Read a notification`, 'user_events', {
        userId: req.user.id,
        eventType: 'UPDATE_READ',
      });
      return { msg: 'Notifications Update Is being processed' };
    } catch (error) {
      throw error;
    }
  }

  @Post('/:userId')
  @ValidateService({ entity: User })
  @Permissions({ module: 'Notifications', moduleLink: 'Manage Notifications' })
  async sendNotification(
    @Body() body: Notification,
    @Service('user') user: User,
  ) {
    try {
      this.rabbitClient.setQueue(RabbitMQQueues.NOTIFICATIONS);
      const data = { ...body, from: user.id };
      await this.rabbitClient.emitWithAck(
        NOTIFICATION_PATTERN.VALIDATE_NOTIFICATION,
        data,
      );
      this.rabbitClient.emit(NOTIFICATION_PATTERN.NOTIFY, data);
      return {
        msg: 'Your notification is being processed, you will be notified when it is sent',
      };
    } catch (error) {
      throw error;
    }
  }
}
