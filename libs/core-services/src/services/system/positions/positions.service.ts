import { Inject, Injectable } from '@nestjs/common';
import { Position } from '@entity/entities/core/positions.entity';
import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { EntityDataSource } from '@bridge/data-bridge/model/enity.data.model';
import { PaginationResults } from '@toolkit/core-toolkit/types/coretypes';

@Injectable()
export class PositionService extends EntityModel<Position> {
  constructor(@Inject(EntityDataSource) source: EntityDataSource) {
    super(Position, source);
  }

  async ViewPositions(): Promise<PaginationResults<Position>> {
    try {
      const results = await this.repository.Paginate(this.pagination);
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

  private async findPositionByName(active = 1) {
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

  private async restoreDeletedPosition() {
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

  async UpdatePosition() {
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
  async DeletePosition() {
    try {
      const exists = await this.repository.findOneBy({ id: this.entity.id });
      if (!exists) {
        throw new Error(`No position found`);
      }
      const results = await this.repository.softDataDelete({ id: exists.id });
      return results.affected === 1;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
