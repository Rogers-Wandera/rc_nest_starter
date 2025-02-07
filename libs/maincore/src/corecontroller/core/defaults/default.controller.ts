import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SystemPermissionsService } from '../../../coreservices/services/defaults/permissions/permissions.service';
import { Request, Response } from 'express';
import {
  NOTIFICATION_PATTERN,
  NotificationTypes,
  PRIORITY_TYPES,
  ROLE,
} from '../../../coretoolkit/types/enums/enums';
import { Notification } from '../../../coretoolkit/decorators/notification.decorator';
import { Permissions } from '../../../coretoolkit/decorators/permissions.decorator';
import {
  AddPermissionsDoc,
  GetPermissionsDoc,
} from '../../core/defaults/default.swagger';
import { Roles } from '../../../authguards/decorators/roles.guard';
import {
  AuthGuard,
  SkipAllGuards,
} from '../../../authguards/guards/auth.guard';
import { Only } from '@core/maincore/authguards/decorators/only.guard';

@Controller('/core/defaults')
@ApiTags('Core Configurations')
@AuthGuard(ROLE.PROGRAMMER)
export class DefaultController {
  constructor(private readonly permission: SystemPermissionsService) {}
  @Post('permissions')
  @Only(ROLE.PROGRAMMER)
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
  @Only(ROLE.PROGRAMMER)
  @GetPermissionsDoc()
  @Permissions({
    module: 'Configurations',
    moduleLink: 'Permissions',
  })
  async GetPermissions(@Res() res: Response) {
    res.status(HttpStatus.OK).json(this.permission.GetPermissions());
  }

  @Post('/push/tokens')
  @Roles(ROLE.USER)
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
  @SkipAllGuards()
  @Notification({
    context: 'before',
    data: {
      type: 'push',
      payload: {
        type: 'system',
        payload: {
          priority: PRIORITY_TYPES.HIGH,
          pattern: NOTIFICATION_PATTERN.SYSTEM_NOTIFICATION,
          type: NotificationTypes.INFO,
          recipient: {
            type: 'no broadcast',
            recipients: [
              {
                to: '2ff0bcbc-8527-49c2-96ba-af60e441df76',
                priority: PRIORITY_TYPES.HIGH,
              },
              {
                to: '6fdc2362-2033-489c-963e-ddf0a8e6cc57',
                priority: PRIORITY_TYPES.LOW,
              },
            ],
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
