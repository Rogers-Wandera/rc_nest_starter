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

@Controller('/core/notifications')
@AuthGuard(ROLE.ADMIN)
@ApiTags('Notifications')
export class NotificationController extends IController<UserService> {
  constructor(
    private readonly rabbitClient: RabbitMQService,
    model: UserService,
    private readonly eventslogger: EventLogger,
  ) {
    super(model);
  }

  @Get('/:userId')
  @ValidateService({ entity: User })
  @Paginate()
  @Roles(ROLE.USER)
  async getNotifications(@Service('user') user: User, @Req() req: Request) {
    try {
      this.rabbitClient.setQueue(RabbitMQQueues.NOTIFICATIONS);
      const respone = await this.rabbitClient.emitWithAck(
        NOTIFICATION_PATTERN.USER_NOTIFICATIONS,
        { userId: user.id, query: req.parsedQuery },
      );
      return respone;
    } catch (error) {
      throw error;
    }
  }

  @Get('/main/data/:userId')
  @Paginate()
  @Permissions({ module: 'Notifications', moduleLink: 'Manage Notifications' })
  async getMainNotifications(@Req() req: Request) {
    try {
      this.rabbitClient.setQueue(RabbitMQQueues.NOTIFICATIONS);
      const respone = await this.rabbitClient.emitWithAck(
        NOTIFICATION_PATTERN.NOTIFICATIONS,
        { query: req.parsedQuery, userId: req.params.userId },
      );
      return respone;
    } catch (error) {
      throw error;
    }
  }

  @Patch('/:recipientId')
  @Roles(ROLE.USER)
  async updateNotification(@Req() req: Request) {
    try {
      this.rabbitClient.setQueue(RabbitMQQueues.NOTIFICATIONS);
      const respone = await this.rabbitClient.emitWithAck(
        NOTIFICATION_PATTERN.UPDATE_READ,
        {
          recipientId: req.params.recipientId,
          readBy: req.user.displayName,
          userId: req.user.id,
        },
      );
      this.eventslogger.logEvent(`User Read a notification`, 'user_events', {
        userId: req.user.id,
        eventType: 'UPDATE_READ',
      });
      return respone;
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
