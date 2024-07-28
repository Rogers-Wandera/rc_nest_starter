import { Injectable } from '@nestjs/common';
import { Notification } from 'src/entity/core/notification.entity';
import { EntityDataSource } from 'src/model/enity.data.model';
import { EntityModel } from 'src/model/entity.model';

@Injectable()
export class NotificationService extends EntityModel<Notification> {
  constructor(datasource: EntityDataSource) {
    super(Notification, datasource);
  }
}
