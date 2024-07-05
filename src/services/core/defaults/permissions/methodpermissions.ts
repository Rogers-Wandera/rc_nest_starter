import { Injectable, RequestMethod, Scope } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { Utilities } from 'src/app/utils/app.utils';
import { METHODS, PermissionRouteType } from '../../auth/auth.types';
import {
  PERMISSION_KEY,
  permissiontype,
} from 'src/app/decorators/permissions.decorator';

@Injectable({ scope: Scope.DEFAULT })
export class MethodPermissions {
  constructor(
    private readonly reflect: Reflector,
    private discovery: DiscoveryService,
    private utils: Utilities,
  ) {}

  public getMethodPermissions() {
    const controllers = this.discovery.getControllers();
    const routes: PermissionRouteType[] = [];

    controllers.forEach((con) => {
      const { instance } = con;
      const controllerPath = this.getControllerPath(instance);
      const methods = this.getInstanceMethods(instance);
      const routemethods = this.getRouteMethods(
        instance,
        methods,
        controllerPath,
      );

      if (routemethods.length > 0) {
        const controllerpermission = this.getControllerPermission(
          instance,
          methods,
        );
        if (controllerpermission) {
          routes.push({
            permission: controllerpermission,
            routes: routemethods,
            dashboardRoute: `/dashboard${controllerPath}`,
          });
        }
      }
    });

    return routes;
  }

  private getRouteMethodDetails(
    mthd: string,
    methodHandler: any,
    controllerPath: string,
    permission: permissiontype,
  ) {
    const methodPath = this.reflect.get<string>(PATH_METADATA, methodHandler);
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
    const routeName = this.utils.formatCamelCase(mthd);
    let actualName = routeName;
    const checkname = routeName.split(' ');
    if (checkname.length <= 1) {
      if (permission.name) {
        actualName = actualName + ' ' + permission.name;
      }
    }
    return {
      name: actualName,
      route: route,
      method: routeMethod,
    };
  }

  private getControllerPermission(
    instance: any,
    methods: string[],
  ): permissiontype | null {
    for (const mthd of methods) {
      if (mthd !== 'constructor') {
        const methodHandler = instance[mthd];
        const permission = this.reflect.get<permissiontype>(
          PERMISSION_KEY,
          methodHandler,
        );
        if (permission) {
          return permission;
        }
      }
    }
    return null;
  }

  private getControllerPath(instance: any): string {
    return this.reflect.get<string>(PATH_METADATA, instance.constructor);
  }

  private getInstanceMethods(instance: any): string[] {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
  }

  private getRouteMethods(
    instance: any,
    methods: string[],
    controllerPath: string,
  ) {
    return methods.reduce(
      (routemethods, mthd) => {
        if (mthd !== 'constructor') {
          const methodHandler = instance[mthd];
          const permission = this.reflect.get<permissiontype>(
            PERMISSION_KEY,
            methodHandler,
          );
          if (permission) {
            const routeMethodDetails = this.getRouteMethodDetails(
              mthd,
              methodHandler,
              controllerPath,
              permission,
            );
            routemethods.push(routeMethodDetails);
          }
        }
        return routemethods;
      },
      [] as { method: METHODS; route: string; name: string }[],
    );
  }
}
