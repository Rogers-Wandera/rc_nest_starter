import { Injectable, RequestMethod, Scope } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
  PERMISSION_KEY,
  permissiontype,
} from 'src/app/decorators/permissions.decorator';
import { METHODS, PermissionRouteType } from '../../auth/auth.types';
import { Utilities } from 'src/app/utils/app.utils';
import { MethodPermissions } from './methodpermissions';
import { ModuleService } from '../../system/modules/modules.service';
import { ModuleLinksService } from '../../system/modulelinks/modulelinks.service';
import { LinkPermissionService } from '../../system/linkpermissions/linkpermissions.service';
import { ModuleLink } from 'src/entity/core/modulelinks.entity';

@Injectable({ scope: Scope.DEFAULT })
export class SystemPermissionsService {
  constructor(
    private readonly reflect: Reflector,
    private discovery: DiscoveryService,
    private utils: Utilities,
    private methodpermissions: MethodPermissions,
    private modules: ModuleService,
    private modulelinks: ModuleLinksService,
    private permissionservice: LinkPermissionService,
  ) {}

  public GetPermissions() {
    const routes: PermissionRouteType[] = [];
    const controllers = this.discovery.getControllers();
    const methodroutes = this.methodpermissions.getMethodPermissions();
    controllers.forEach((controller) => {
      const data = this.GetRouteMethods(controller);
      if (data) {
        routes.push(data);
      }
    });

    return [...routes, ...methodroutes];
  }

  private GetRouteMethods(controller: InstanceWrapper<any>) {
    const { instance } = controller;
    const data: PermissionRouteType = {} as PermissionRouteType;
    if (instance) {
      const permission = this.reflect.get<permissiontype>(
        PERMISSION_KEY,
        instance.constructor,
      );
      if (permission) {
        const controllerPath = this.reflect.get<string>(
          PATH_METADATA,
          instance.constructor,
        );
        const methods = Object.getOwnPropertyNames(
          Object.getPrototypeOf(instance),
        );
        const permissions = this.HandleMethods(
          methods,
          instance,
          controllerPath,
          permission,
        );
        data.permission = permission;
        data.dashboardRoute = `/dashboard${controllerPath}`;
        data.routes = permissions;
        return data;
      }
    }
    return null;
  }

  private HandleMethods(
    methods: string[],
    instance: any,
    controllerPath: string,
    permission: permissiontype,
  ) {
    const routemethods: { method: METHODS; route: string; name: string }[] = [];
    methods.forEach((method) => {
      if (method !== 'constructor') {
        const methodHandler = instance[method];
        const methodPath = this.reflect.get<string>(
          PATH_METADATA,
          methodHandler,
        );
        const requestMethod = this.reflect.get<RequestMethod>(
          METHOD_METADATA,
          methodHandler,
        );
        const baseUri = `${controllerPath}`;
        const routeMethod = RequestMethod[requestMethod] as METHODS;
        const actualPath = methodPath.startsWith('/')
          ? methodPath.substring(1)
          : methodPath;
        const route = methodPath === '/' ? baseUri : `${baseUri}/${actualPath}`;
        const routeName = this.utils.formatCamelCase(method);
        let actualName = routeName;
        const checkname = routeName.split(' ');
        if (checkname.length <= 1) {
          if (permission.name) {
            actualName = actualName + ' ' + permission.name;
          }
        }

        routemethods.push({
          name: actualName,
          route: route,
          method: routeMethod,
        });
      }
    });
    return routemethods;
  }

  async AddPermissions(userId: string) {
    try {
      const permission = this.GetPermissions();
      const modules = permission.map((pm) => pm.permission.module);
      if (permission.length > 0) {
        await this.HandleModules(modules, userId);
        await this.HandleModuleLinks(permission, userId);
        for (let i = 0; i < permission.length; i++) {
          await this.HandlePermissions(permission[i], userId);
        }
        return { msg: 'Permissions added successfully' };
      }
      return { msg: 'No permsssions to add' };
    } catch (error) {
      throw error;
    }
  }

  private async HandleModuleLinks(
    permissions: PermissionRouteType[],
    userId: string,
  ) {
    try {
      for (let i = 0; i < permissions.length; i++) {
        const moduleexists = await this.modules.FindOne({
          name: permissions[i].permission.module,
        });
        if (moduleexists) {
          const modulelink = await this.modulelinks.FindOne({
            linkname: permissions[i].permission.moduleLink,
            module: { id: moduleexists.id },
          });
          if (!modulelink) {
            this.modulelinks.entity.linkname =
              permissions[i].permission.moduleLink;
            this.modulelinks.entity.route = permissions[i].dashboardRoute;
            this.modulelinks.entity.createdBy = userId;
            this.modulelinks.entity.updatedBy = userId;
            await this.modulelinks.addModuleLink(moduleexists.id);
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  private async HandleModules(modules: string[], userId: string) {
    try {
      for (let i = 0; i < modules.length; i++) {
        const moduleexists = await this.modules.FindOne({ name: modules[i] });
        if (!moduleexists) {
          this.modules.entity.name = modules[i];
          this.modules.entity.createdBy = userId;
          this.modules.entity.updatedBy = userId;
          await this.modules.addModule();
        }
      }
    } catch (error) {
      throw error;
    }
  }

  private async HandlePermissions(
    permissions: PermissionRouteType,
    userId: string,
  ) {
    try {
      const moduleexists = await this.modules.FindOne({
        name: permissions.permission.module,
      });
      if (moduleexists) {
        const modulelink = await this.modulelinks.FindOne({
          linkname: permissions.permission.moduleLink,
          module: { id: moduleexists.id },
        });
        for (let i = 0; i < permissions.routes.length; i++) {
          await this.AddPermission(
            userId,
            permissions.routes[i],
            modulelink,
            permissions.permission,
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }

  private async AddPermission(
    userId: string,
    route: { method: METHODS; route: string; name: string },
    modulelink: ModuleLink,
    permission: permissiontype,
  ) {
    if (modulelink) {
      const permissionexists = await this.permissionservice.FindOne({
        ModuleLink: { id: modulelink.id },
        method: route.method,
        accessName: route.name,
      });
      if (!permissionexists) {
        this.permissionservice.entity.ModuleLink = modulelink;
        this.permissionservice.entity.accessName = route.name;
        this.permissionservice.entity.accessRoute = route.route;
        this.permissionservice.entity.method = route.method;
        this.permissionservice.entity.description = `This route is used to ${route.method.toLowerCase()} data from ${permission.moduleLink.toLocaleLowerCase()} route`;
        this.permissionservice.entity.createdBy = userId;
        this.permissionservice.entity.updatedBy = userId;
        const response = await this.permissionservice.AddPermission();
        return response;
      }
    }
  }
}
