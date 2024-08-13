import { UserGroup } from '@entity/entities/core/usergroups.entity';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

@EventSubscriber()
export class UserGroupSubscriber
  implements EntitySubscriberInterface<UserGroup>
{
  listenTo() {
    return UserGroup;
  }

  beforeInsert(event: InsertEvent<UserGroup>): Promise<any> | void {
    if (
      event.entity.description === '' ||
      event.entity.description === null ||
      event.entity.description === undefined
    ) {
      event.entity.description = `This group is for the ${event.entity.groupName} group`;
    }
  }
}
