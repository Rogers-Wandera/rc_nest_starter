import { Controller } from '@nestjs/common';
import { IController } from 'src/controllers/controller.interface';
import { NotificationService } from '../../../services/core/notifications/notification.service';

@Controller('/core/notifications')
export class NotificationController extends IController<NotificationService> {
  constructor(model: NotificationService) {
    super(model);
  }
}
