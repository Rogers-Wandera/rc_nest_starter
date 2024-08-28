import { METHODS } from '@core/maincore/coretoolkit/types/enums/enums';
import { BaseEntityView } from '@core/maincore/entities/baseview';

export class RolePermissionsData extends BaseEntityView {
  id: number;
  accessName: string;
  accessRoute: string;
  method: METHODS;
  description: string;
  moduleLinkId: number;
  linkname: string;
  name: string;
  route: string;
  render: number;
  roleId: null | number;
  rpId: null | number;
  userId: null | string;
  checked: number;
  groupId: number;
  groupName: null | string;
  memberId: null | number;
  userName: null | string;
  permissionType: 'user' | 'group';
}
