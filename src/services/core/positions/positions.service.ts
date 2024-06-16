import { Inject, Injectable } from '@nestjs/common';
import { PaginationResults } from 'src/app/conn/conntypes';
import { DatabaseService } from 'src/db/database.provider';
import { Position } from 'src/entity/core/positions.entity';
import { EntityModel } from 'src/model/entity.model';

@Injectable()
export class PositionService extends EntityModel<Position> {
  constructor(@Inject('data_source') model: DatabaseService) {
    super(Position, model);
  }

  async ViewPositions(): Promise<PaginationResults<Position>> {
    try {
      const results = await this.model.findPaginate(Position, this.pagination);
      return results;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async ViewSinglePosition(): Promise<Position> {
    try {
      const results = await this.repository.findOneBy({
        id: this.entity.id,
      });
      return results;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findPositionByName(active = 1) {
    try {
      const exists = await this.repository.findOneWithValue(
        'position',
        this.entity.position,
        { isActive: active },
      );
      return exists;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async restoreDeletedPosition() {
    try {
      const exists = await this.findPositionByName(0);
      if (exists) {
        this.entity.id = exists.id;
        const response = await this.repository.restoreDelete({
          id: this.entity.id,
        });
        this.entity.id = null;
        return response.affected === 1;
      }
      return false;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createPosition() {
    try {
      const exists = await this.findPositionByName();
      if (exists) {
        throw new Error('Position already exists');
      }
      const response = await this.restoreDeletedPosition();
      if (response == true) {
        return { success: true };
      }
      const results: Position = await this.repository.save(this.entity);
      if (results.id) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async UpdatePositions() {
    try {
      const results = await this.repository.FindOneAndUpdate(
        { id: this.entity.id },
        { position: this.entity.position },
      );
      return results;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  //   delete function
  async DeletePositions() {
    try {
      const exists = await this.repository.findOneBy({ id: this.entity.id });
      if (!exists) {
        throw new Error(`No position found`);
      }
      const results = await this.repository.softDataDelete(exists, {
        deletedBy: this.entity.deletedBy,
      });
      return results.affected === 1;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
