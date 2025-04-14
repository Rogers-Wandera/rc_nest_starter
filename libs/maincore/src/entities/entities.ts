import { LinkPermission } from './core/linkpermissions.entity';
import { LinkRole } from './core/linkroles.entity';
import { ModuleLink } from './core/modulelinks.entity';
import { Module } from './core/modules.entity';
import { Position } from './core/positions.entity';
import { Recyclebin } from './core/recyclebin.entity';
import { RefreshToken } from './core/refreshtokens.entity';
import { RolePermission } from './core/rolepermissions.entity';
import { Role } from './core/roles.entity';
import { ServerRouteMethod } from './core/serverroutemethods.entity';
import { ServerRouteRole } from './core/serverrouteroles.entity';
import { Systemrole } from './core/systemroles.entity';
import { Token } from './core/tokens.entity';
import { Updates } from './core/update.entity';
import { UserGroupMember } from './core/usergroupmembers.entity';
import { UserGroup } from './core/usergroups.entity';
import { UserGroupSupervisors } from './core/usergroupsupervisors.entity';
import { UserProfileImage } from './core/userprofileimages.entity';
import { User } from './core/users.entity';
import { GroupLinkRolesView } from './coreviews/grouplinkroles.view';
import { LinkPermissionView } from './coreviews/linkpermissions.view';
import { ModuleLinksView } from './coreviews/modulelinks.view';
import { ModuleRolesView } from './coreviews/moduleroles.view';
import { PermissionRolesView } from './coreviews/permissions.view';
import { ServerRolesView } from './coreviews/serverroute.view';
import { UserModuleRolesView } from './coreviews/user.moduleroles.view';
import { UserDataView } from './coreviews/userdata.view';
import { UserLinkRolesView } from './coreviews/userlinkroles.view';
import { UserRolesView } from './coreviews/userroles.view';

export const entities = [
  LinkPermission,
  LinkRole,
  ModuleLink,
  Module,
  Position,
  Recyclebin,
  RefreshToken,
  RolePermission,
  Role,
  ServerRouteMethod,
  ServerRouteRole,
  Systemrole,
  Token,
  Updates,
  UserGroupMember,
  UserGroup,
  UserGroupSupervisors,
  UserProfileImage,
  User,
];

export const views = [
  GroupLinkRolesView,
  LinkPermissionView,
  ModuleLinksView,
  ModuleRolesView,
  PermissionRolesView,
  ServerRolesView,
  UserModuleRolesView,
  UserDataView,
  UserLinkRolesView,
  UserRolesView,
];
