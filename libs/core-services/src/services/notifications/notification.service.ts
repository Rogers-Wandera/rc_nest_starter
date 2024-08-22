import { Injectable } from '@nestjs/common';
import { Notification } from '@entity/entities/defaults[noedit]/notifications/notification';
import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { EntityDataSource } from '@bridge/data-bridge/model/enity.data.model';

@Injectable()
export class NotificationService extends EntityModel<Notification, string> {
  constructor(datasource: EntityDataSource) {
    super(Notification, datasource);
  }
}
