import { format } from 'date-fns';
import { EntityManager } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Recyclebin } from '../../entities/core/recyclebin.entity';

/**
 * DataUtility class provides utility methods for handling operations related to the recycle bin.
 */
export class DataUtility {
  /**
   * The EntityManager instance used to interact with the database.
   * @type {EntityManager}
   */
  manager: EntityManager;

  /**
   * Initializes the DataUtility with the provided EntityManager.
   *
   * @param {EntityManager} manager - The EntityManager instance.
   */
  constructor(manager: EntityManager) {
    this.manager = manager;
  }

  /**
   * Saves a record to the recycle bin.
   *
   * @param {string} original_table - The name of the original table from which the record is deleted.
   * @param {string | number} original_record_id - The ID of the original record that is deleted.
   * @param {string} createdBy - The identifier of the user who deleted the record.
   * @returns {Promise<Recyclebin>} A promise that resolves to the saved Recyclebin record.
   * @throws {BadRequestException} If an error occurs during the save operation.
   */
  public async saveRecycleBin(
    original_table: string,
    original_record_id: string | number,
    createdBy: string,
  ): Promise<Recyclebin> {
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

  /**
   * Restores a deleted record from the recycle bin.
   *
   * @param {string} table - The name of the table from which the record was originally deleted.
   * @param {string} id - The ID of the record to be restored.
   * @returns {Promise<boolean>} A promise that resolves to true if the record was restored, false otherwise.
   * @throws {BadRequestException} If an error occurs during the restore operation.
   */
  public async restoreDelete(table: string, id: string): Promise<boolean> {
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

  /**
   * Deletes records related to the specified table and ID from the recycle bin.
   *
   * @param {string} table - The name of the original table.
   * @param {string} id - The ID of the original record.
   * @returns {Promise<boolean>} A promise that resolves to true if records were deleted, false otherwise.
   * @throws {BadRequestException} If an error occurs during the delete operation.
   */
  async deleteRecycleData(table: string, id: string): Promise<boolean> {
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
