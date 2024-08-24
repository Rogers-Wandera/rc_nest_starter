import { Controller } from '@nestjs/common';
import { NotificationService } from '../../../coreservices/services/notifications/notification.service';
import { IController } from '../../controller.interface';

@Controller('/core/notifications')
export class NotificationController extends IController<NotificationService> {
  constructor(model: NotificationService) {
    super(model);
  }
}
