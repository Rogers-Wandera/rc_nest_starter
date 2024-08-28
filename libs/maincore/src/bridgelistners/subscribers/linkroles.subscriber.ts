import { LinkRole } from '@core/maincore/entities/core/linkroles.entity';
import { BadRequestException } from '@nestjs/common';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

@EventSubscriber()
export class LinkRolesSubscriber
  implements EntitySubscriberInterface<LinkRole>
{
  listenTo() {
    return LinkRole;
  }

  beforeInsert(event: InsertEvent<LinkRole>): Promise<any> | void {
    if (event.entity.User && event.entity.group) {
      throw new BadRequestException(
        'User and group cannot be set at the same time',
      );
    }
  }
}
