import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response } from 'express';
import { catchError, Observable, throwError } from 'rxjs';
import { PRIORITY_TYPES } from 'src/app/app.types';
import { Notification } from 'src/app/decorators/notification.decorator';
import { Permissions } from 'src/app/decorators/permissions.decorator';
import { Role, Roles } from 'src/app/decorators/roles.decorator';
import { NOTIFICATION_PATTERN } from 'src/app/patterns/notification.patterns';
import { EmailTemplates } from 'src/app/types/enums/emailtemplates.enum';
import { NotificationTypes } from 'src/app/types/enums/notifyresponse.enum';
import { RabbitMQService } from 'src/micro/microservices/rabbitmq.service';
import {
  EMailGuard,
  JwtGuard,
  RolesGuard,
} from 'src/services/core/auth/authguards/authguard.guard';
import { SystemPermissionsService } from 'src/services/core/defaults/permissions/permissions.service';
import {
  AddPermissionsDoc,
  GetPermissionsDoc,
} from 'src/swagger/controllers/core/defaultcontroller';

@Controller('/core/defaults')
@ApiTags('Core Configurations')
// @UseGuards(JwtGuard, EMailGuard, RolesGuard)
// @Roles(Role.PROGRAMMER)
export class DefaultController {
  constructor(private readonly permission: SystemPermissionsService) {}
  @Post('permissions')
  @Roles(Role.PROGRAMMER)
  @AddPermissionsDoc()
  @Permissions({
    module: 'Configurations',
    moduleLink: 'Permissions',
  })
  async AddPermissions(@Res() res: Response, @Req() req: Request) {
    const data = await this.permission.AddPermissions(req.user.id);
    res.status(HttpStatus.OK).json(data);
  }
  @Get('permissions')
  @Roles(Role.PROGRAMMER)
  @GetPermissionsDoc()
  @Permissions({
    module: 'Configurations',
    moduleLink: 'Permissions',
  })
  async GetPermissions(@Res() res: Response) {
    res.status(HttpStatus.OK).json(this.permission.GetPermissions());
  }

  @Post('/push/tokens')
  @Roles(Role.USER)
  @Permissions({
    module: 'Configurations',
    moduleLink: 'Permissions',
  })
  async RegisterNotificationTokens(
    @Body(new ValidationPipe()) body: { token: string },
    @Res() res: Response,
  ) {
    try {
      res.status(HttpStatus.OK).json({ msg: 'Token registered' });
    } catch (error) {
      throw error;
    }
  }
  @Get('send-notification')
  @Notification({
    context: 'before',
    data: {
      type: 'push',
      payload: {
        type: 'system',
        payload: {
          priority: PRIORITY_TYPES.HIGH,
          pattern: NOTIFICATION_PATTERN.ANNOUNCEMENTS,
          type: NotificationTypes.INFO,
          recipient: {
            type: 'no broadcast',
            recipients: ['testuser', 'testagain'],
          },
          data: {
            title: 'Hello World',
            message: 'This is an introduction to RTECH software systems',
            timestamp: new Date(),
            meta: { Urgent: true, 'Reply To': 'Rogers' },
            mediaUrl: [
              { imageUrl: 'https://test.com', type: 'image' },
              { imageUrl: 'https://test2.com', type: 'audio' },
            ],
          },
        },
      },
    },
  })
  sendNotification() {
    try {
      console.log('i have executed');
      return 'yooo';
    } catch (error) {
      throw error;
    }
  }
}
