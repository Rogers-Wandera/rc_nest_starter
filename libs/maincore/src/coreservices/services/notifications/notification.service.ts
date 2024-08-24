import { Injectable } from '@nestjs/common';
import { Notification } from '../../../entities/defaults[noedit]/notifications/notification';
import { EntityModel } from '../../../databridge/model/entity.model';
import { EntityDataSource } from '../../../databridge/model/enity.data.model';

@Injectable()
export class NotificationService extends EntityModel<Notification, string> {
  constructor(datasource: EntityDataSource) {
    super(Notification, datasource);
  }
}
