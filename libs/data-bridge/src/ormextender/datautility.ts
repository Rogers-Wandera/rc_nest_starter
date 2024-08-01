import { format } from 'date-fns';
import { EntityManager } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Recyclebin } from '@entity/entities/core/recyclebin.entity';

export class DataUtility {
  manager: EntityManager;
  constructor(manager: EntityManager) {
    this.manager = manager;
  }
  public async saveRecycleBin(
    original_table: string,
    original_record_id: string | number,
    createdBy: string,
  ) {
    try {
      const entity = this.manager.getRepository(Recyclebin);
      const recyclebin = new Recyclebin();
      recyclebin.isActive = 1;
      recyclebin.original_record_id = original_record_id as string;
      recyclebin.original_table_name = original_table;
      recyclebin.deletedBy = createdBy;
      recyclebin.createdBy = createdBy;
      recyclebin.deletedAt = format(
        new Date(),
        'yyyy-MM-dd HH:mm:ss',
      ) as unknown as Date;
      const results = await entity.save(recyclebin);
      return results;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async restoreDelete(table: string, id: string) {
    try {
      const entity = this.manager.getRepository(Recyclebin);
      const exists = await entity
        .createQueryBuilder()
        .withDeleted()
        .where({ original_table_name: table, original_record_id: id })
        .getOne();
      if (exists) {
        await entity.remove(exists);
        return true;
      }
      return false;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteRecycleData(table: string, id: string) {
    try {
      const entity = this.manager.getRepository(Recyclebin);
      const data = await entity
        .createQueryBuilder()
        .withDeleted()
        .where({
          original_table_name: table,
          original_record_id: id,
        })
        .getMany();

      if (data.length > 0) {
        await entity.remove(data);
        return true;
      }
      return false;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
