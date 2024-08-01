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
import { SystemPermissionsService } from '@services/core-services/services/defaults/permissions/permissions.service';
import { Request, Response } from 'express';
import { PRIORITY_TYPES } from '@toolkit/core-toolkit/types/enums/enums';
import { Notification } from '@toolkit/core-toolkit/decorators/notification.decorator';
import { Permissions } from '@toolkit/core-toolkit/decorators/permissions.decorator';
import { Role, Roles } from '@toolkit/core-toolkit/decorators/roles.decorator';
import { EmailTemplates } from '@toolkit/core-toolkit/types/enums/emailtemplates.enum';
import {
  AddPermissionsDoc,
  GetPermissionsDoc,
} from '@controller/core-controller/swagger/controllers/core/defaultcontroller';

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
      type: 'email',
      createdBy: 'Rogers',
      payload: {
        template: EmailTemplates.MAILER_2,
        priority: 'high',
        subject: 'Rogers',
        to: [{ to: 'rogerrisha@gmail.com', priority: PRIORITY_TYPES.HIGH }],
        context: {
          body: 'Hello world did i say am testing everything',
          title: 'Come on men',
          cta: false,
        },
      },
      // payload: {
      //   type: 'system',
      //   payload: {
      //     priority: PRIORITY_TYPES.HIGH,
      //     pattern: NOTIFICATION_PATTERN.ANNOUNCEMENTS,
      //     type: NotificationTypes.INFO,
      //     recipient: {
      //       type: 'no broadcast',
      //       recipients: [
      //         {
      //           to: '2ff0bcbc-8527-49c2-96ba-af60e441df76',
      //           priority: PRIORITY_TYPES.HIGH,
      //         },
      //         {
      //           to: '6fdc2362-2033-489c-963e-ddf0a8e6cc57',
      //           priority: PRIORITY_TYPES.LOW,
      //         },
      //       ],
      //     },
      //     data: {
      //       title: 'Hello World',
      //       message: 'This is an introduction to RTECH software systems',
      //       timestamp: new Date(),
      //       meta: { Urgent: true, 'Reply To': 'Rogers' },
      //       mediaUrl: [
      //         { imageUrl: 'https://test.com', type: 'image' },
      //         { imageUrl: 'https://test2.com', type: 'audio' },
      //       ],
      //     },
      //   },
      // },
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
