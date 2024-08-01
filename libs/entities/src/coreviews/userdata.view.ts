import { ViewColumn, ViewEntity } from 'typeorm';
import { Position } from '../core/positions.entity';
import { UserProfileImage } from '../core/userprofileimages.entity';
import { User } from '../core/users.entity';

@ViewEntity({
  name: 'userdata',
  expression: (model) =>
    model
      .createQueryBuilder()
      .select('u.*')
      .addSelect('ps.position', 'position')
      .addSelect('upi.image', 'image')
      .addSelect("CONCAT(`u`.`firstname`, ' ', `u`.`lastname`)", 'userName')
      .from(User, 'u')
      .innerJoin(Position, 'ps', 'ps.id = u.positionId')
      .leftJoin(UserProfileImage, 'upi', 'upi.user = u.id'),
})
export class UserDataView {
  @ViewColumn()
  id: string;
  @ViewColumn()
  firstname: string;
  @ViewColumn()
  lastname: string;
  @ViewColumn()
  email: string;
  @ViewColumn()
  password: string;
  @ViewColumn()
  tel: string;
  @ViewColumn()
  verified: number;
  @ViewColumn()
  creationDate: Date;
  @ViewColumn()
  lastloginDate: Date;
  @ViewColumn()
  isLocked: number;
  @ViewColumn()
  isActive: number;
  @ViewColumn()
  deleted_at: Date;
  @ViewColumn()
  adminCreated: number;
  @ViewColumn()
  position: string;
  @ViewColumn()
  positionId: number;
  @ViewColumn()
  gender: string;
  @ViewColumn()
  userName: string;
  @ViewColumn()
  image: string;
  @ViewColumn()
  online: string;
}
