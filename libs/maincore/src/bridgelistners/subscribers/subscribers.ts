import { LinkRolesSubscriber } from './linkroles.subscriber';
import { UpdatesSubscriber } from './updates.subscriber';
import { UserGroupSubscriber } from './usergroup.subscriber';

export const subscribers = [
  LinkRolesSubscriber,
  UpdatesSubscriber,
  UserGroupSubscriber,
];
