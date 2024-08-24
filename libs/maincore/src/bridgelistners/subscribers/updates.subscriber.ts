import { Updates } from '../../entities/core/update.entity';
import { format } from 'date-fns';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export class UpdatesSubscriber implements EntitySubscriberInterface<Updates> {
  async beforeUpdate(event: UpdateEvent<Updates>) {
    if (event.databaseEntity && event.entity) {
      const fromentity = event.databaseEntity;
      const toentity = event.entity;
      const name = event.metadata.name;
      const tableName = event.metadata.tableName;
      toentity['updateDate'] = format(new Date(), 'yyyy-MM-dd H:i:s');
      const fromValue = JSON.stringify(fromentity);
      const toValue = JSON.stringify(toentity);
      await this.HandleUpdates(event, name, tableName, fromValue, toValue);
    }
  }
  private async HandleUpdates(
    event: UpdateEvent<Updates>,
    name: string,
    tableName: string,
    fromValue: string,
    toValue: string,
  ) {
    const repository = event.manager.getRepository(Updates);
    const data = new Updates();
    data.entityName = name;
    data.tableName = tableName;
    data.fromValue = fromValue;
    data.toValue = toValue;
    await repository.save(data);
  }
}
