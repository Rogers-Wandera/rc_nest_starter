import { BadRequestException, Injectable } from '@nestjs/common';
import { ServerRouteRole } from 'src/entity/core/serverrouteroles.entity';
import { EntityDataSource } from 'src/model/enity.data.model';
import { EntityModel } from 'src/model/entity.model';
import { ServerRouteMethodService } from '../serverroutemethods/serverroutemethod.service';
import { ServerRolesView } from 'src/entity/coreviews/serverroute.view';
import { CustomRepository } from 'src/app/conn/customrepository';

enum METHODS {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  PUT = 'PUT',
  OPTIONS = 'OPTIONS',
}
@Injectable()
export class ServerRouteRoleService extends EntityModel<ServerRouteRole> {
  private readonly serverview: CustomRepository<ServerRolesView>;
  constructor(
    source: EntityDataSource,
    private readonly servermethod: ServerRouteMethodService,
  ) {
    super(ServerRouteRole, source);
    this.serverview = this.model.getRepository(ServerRolesView);
  }

  async addServerRoute(method: METHODS) {
    try {
      const response = await this.repository.save(this.entity);
      this.servermethod.entity.serverroute = response;
      this.servermethod.entity.method = method;
      this.servermethod.entity.createdBy = this.entity.createdBy;
      await this.servermethod.AddMethod();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async DeleteServerRoute() {
    try {
      const response = await this.serverview.findOne({
        where: {
          permissionId: this.entity.rolepermission.id,
          userId: this.entity.rolepermission.user.id,
          method: this.entity.rolepermission.linkpermission.method,
          roleValue: this.entity.rolepermission.linkpermission.accessRoute,
          isActive: 1,
        },
      });
      if (!response) {
        throw new BadRequestException('No role permission found');
      }
      const results = await this.repository.softDataDelete({
        id: response.serverRouteId,
      });
      this.servermethod.entity.id = response.id;
      if (results.affected === 1) {
        await this.servermethod.DeleteMethod();
      }
      return results.affected === 1;
    } catch (error) {
      throw error;
    }
  }

  async RestoreDeleted() {
    try {
      const response = await this.serverview.findOne({
        where: {
          permissionId: this.entity.rolepermission.id,
          userId: this.entity.rolepermission.user.id,
          method: this.entity.rolepermission.linkpermission.method,
          roleValue: this.entity.rolepermission.linkpermission.accessRoute,
        },
        withDeleted: true,
      });
      if (response) {
        await this.repository.restoreDelete({ id: response.serverRouteId });
        this.servermethod.entity.id = response.id;
        await this.servermethod.RestoreMethod();
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }
}
