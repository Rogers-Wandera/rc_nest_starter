import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { User } from '@entity/entities/core/users.entity';
import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { EntityDataSource } from '@bridge/data-bridge/model/enity.data.model';
import { v4 as uuid } from 'uuid';
import { addrolestype, registertype } from './users.types';
import { TokenService } from '../../system/tokens/tokens.service';
import { addHours, format } from 'date-fns';
import bcrptjs from 'bcryptjs';
import crypto from 'crypto';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PositionService } from '../../system/positions/positions.service';
import { RoleService } from '../roles/roles.service';
import { SystemRolesService } from '../systemroles/systemroles.service';
import { RefreshTokenService } from '../refreshtokens/refreshtokens.service';
import { UserDataView } from '@entity/entities/coreviews/userdata.view';
import { UserRolesView } from '@entity/entities/coreviews/userroles.view';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ServerRolesView } from '@entity/entities/coreviews/serverroute.view';
import { ServerRolesType } from '../auth.types';
import { RabbitMQService } from '@toolkit/core-toolkit/micro/microservices/rabbitmq.service';
import { NotifyTypes } from '@toolkit/core-toolkit/types/notification/notify.types';
import { EmailTemplates } from '@services/core-services/types/enums';
import { NOTIFICATION_PATTERN } from '@services/core-services/types/enums';
import { PRIORITY_TYPES } from '@services/core-services/types/enums';
import { CustomRepository } from '@bridge/data-bridge/ormextender/customrepository';

@Injectable()
export class UserService extends EntityModel<User> {
  public positionId: number;
  private userviewrepo: CustomRepository<UserDataView>;
  constructor(
    @Inject(EntityDataSource) source: EntityDataSource,
    private readonly tokens: TokenService,
    private readonly jwtService: JwtService,
    private readonly positions: PositionService,
    private readonly roles: RoleService,
    private readonly systemroles: SystemRolesService,
    @Inject(forwardRef(() => RefreshTokenService))
    private readonly refreshtoken: RefreshTokenService,
    @Inject(REQUEST) protected request: Request,
    private client: RabbitMQService,
  ) {
    super(User, source);
    this.positionId = null;
    this.userviewrepo = this.model.getRepository(UserDataView);
  }

  getuuid() {
    return uuid();
  }
  public tokenService(): RefreshTokenService {
    return this.refreshtoken;
  }
  async ViewSingleUser(conditions?: Partial<User>): Promise<User> {
    try {
      const finduser = await this.repository.findOneBy({
        ...conditions,
        id: this.entity.id,
      });
      if (!finduser) {
        throw new Error(`No user found`);
      }
      return finduser;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createUser(data: registertype) {
    this.entity.email = data.email;
    this.entity.firstname = data.firstname;
    this.entity.lastname = data.lastname;
    this.entity.password = data.password;
    this.entity.adminCreated = data.adminCreated;
    this.entity.gender = data.gender;
    this.entity.tel = data.tel;
    this.positionId = data.positionId;
    const userrole = await this.systemroles.FindOne({
      rolename: 'User',
      isActive: 1,
    });
    if (!userrole) {
      throw new NotFoundException('No roles found');
    }
    const userexists = await this.repository.findByConditions({
      email: this.entity.email,
    });
    if (userexists.length > 0) {
      throw new UnauthorizedException(
        `User with ${this.entity.email} already exists`,
      );
    }
    this.positions.entity.id = this.positionId;
    const position = await this.positions.ViewSinglePosition();
    if (!position) {
      throw new NotFoundException('No position Found');
    }
    const hashedPassword = await bcrptjs.hash(this.entity.password, 10);
    const token = crypto.randomBytes(32).toString('hex');
    this.tokens.entity.token = token;
    const expireDate = addHours(new Date(), 2);
    const formatdate = format(expireDate, 'yyyy-MM-dd HH:mm:ss');
    this.entity.password = hashedPassword;
    this.entity.verified = 0;
    this.entity.position = position;
    this.entity.id = this.getuuid();
    this.entity.createdBy = this.entity.id;
    const user = await this.repository.save(this.entity);
    this.tokens.entity.user = user;
    this.tokens.entity.expire = new Date(formatdate);
    this.tokens.entity.createdBy = user.id;
    this.roles.entity.user = user;
    this.roles.entity.systemRole = userrole;
    this.roles.entity.createdBy = user.id;
    await this.tokens.CreateToken();
    await this.roles.createRoles();
    const verify = `${process.env.BASE_URL}/core/auth/user/verification/verify/${this.encryptUrl(user.id)}/${this.encryptUrl(token)}`;
    let additionaldata: string | string[] = '';
    if (data.adminCreated == 1) {
      additionaldata = [`Please login using this password ${data.password}`];
    }
    const response = await this.sendVerificationEmail(
      user,
      verify,
      additionaldata,
    );
    return response;
  }

  private async GetServerRoles(user: UserDataView): Promise<ServerRolesType[]> {
    const serveraccess = await this.model
      .getRepository(ServerRolesView)
      .find({ where: { userId: user.id, expired: 0 } });
    if (serveraccess.length > 0) {
      const res: ServerRolesType[] = serveraccess.map((data) => {
        return {
          roleName: data.roleName,
          roleValue: data.roleValue,
          expired: data.expired,
          days_left: data.days_left,
          userId: data.userId,
          method: data.method,
        };
      });
      return res;
    }
    return [];
  }

  async UserLogin() {
    const { email, password } = this.entity;
    const { manager } = this.model;
    const user = await manager.findOneBy(UserDataView, {
      email,
    });
    if (!user) {
      throw new UnauthorizedException(`No user with ${email} found`);
    }
    const systemuser = await this.repository.findOneBy({ email });
    const isMatch = await bcrptjs.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Passwords donot match');
    }
    if (user.isLocked >= 1) {
      throw new ForbiddenException('Your account is locked contact admin');
    }
    const dbroles = await manager.find(UserRolesView, {
      where: { userId: user.id },
    });
    const lastloginDate = format(
      new Date(),
      'yyyy-MM-dd HH:mm:ss',
    ) as unknown as Date;
    const roles = dbroles.map((r) => r.role);
    await this.repository.FindOneAndUpdate(
      { id: user.id },
      { lastloginDate, updatedBy: user.id },
    );
    const serverroles = await this.GetServerRoles(user);
    const accessToken: string = await this.createAccessToken(
      user,
      roles,
      serverroles,
    );
    const refreshToken: string = await this.createRefreshToken(
      user,
      roles,
      serverroles,
    );
    this.refreshtoken.entity.token = refreshToken;
    this.refreshtoken.entity.user = systemuser;
    this.refreshtoken.entity.createdBy = user.id;
    await this.refreshtoken.AddRefreshtokens();
    return {
      msg: `Successfully signed in as ${user.firstname}`,
      accessToken,
      id: user.id,
    };
  }

  private readonly jwtPayload = (
    user: UserDataView,
    roles: number[],
    serverroles: ServerRolesType[],
  ) => {
    return {
      user: {
        id: user.id,
        isLocked: user.isLocked,
        roles: roles,
        verified: user.verified,
        adminCreated: user.adminCreated,
        displayName: user.userName,
        position: user.position,
        image: this.encryptData(user.image),
        serverroles: serverroles,
      },
      sub: user.id,
    };
  };

  private createAccessToken(
    user: UserDataView,
    roles: number[],
    serverroles: ServerRolesType[],
  ): Promise<string> {
    const payload = this.jwtPayload(user, roles, serverroles);
    return this.jwtService.signAsync(payload);
  }

  private createRefreshToken(
    user: UserDataView,
    roles: number[],
    serverroles: ServerRolesType[],
  ): Promise<string> {
    const payload = this.jwtPayload(user, roles, serverroles);
    return this.jwtService.signAsync(payload, { expiresIn: '1d' });
  }
  async HandleRefreshToken() {
    const user = await this.model.manager.findOneBy(UserDataView, {
      id: this.entity.id,
    });
    if (!user) {
      throw new UnauthorizedException(`No user found`);
    }
    const token = await this.refreshtoken.HandleRefreshToken(user);
    return token;
  }

  public getToken(
    user: UserDataView,
    roles: number[],
    serverroles: ServerRolesType[],
  ): Promise<string> {
    return this.createAccessToken(user, roles, serverroles);
  }

  async addRole(data: addrolestype) {
    try {
      const role = await this.systemroles.FindOne({ id: data.roleId });
      const user = await this.FindOne({ id: data.userId });
      if (!role) {
        throw new NotFoundException(`No role found`);
      }
      if (!user) {
        throw new ForbiddenException(`No user found`);
      }
      this.roles.entity.systemRole = role;
      this.roles.entity.user = user;
      this.roles.entity.createdBy = this.entity.createdBy;
      const response = await this.roles.createRoles();
      return response;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('This role already exists on the user');
      }
      throw error;
    }
  }

  async RemoveRole(data: addrolestype) {
    try {
      const response = await this.roles.RemoveRole(data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  private userData(user: UserDataView, emailshow = false) {
    user['email'] = emailshow ? user['email'] : null;
    user['password'] = null;
    return user;
  }

  async ViewUsers() {
    try {
      const query = 'SELECT *FROM userdata';
      const data = await this.CustomPaginateData<UserDataView>(query);
      if (data.docs.length > 0) {
        const docs = data.docs.map((item) => this.userData(item));
        return { ...data, docs };
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async DeleteUser() {
    try {
      const user = await this.repository.findOne({
        where: { id: this.entity.id },
      });
      if (!user) {
        throw new BadRequestException('No user found');
      }
      if (user.id === this.request.user.id) {
        throw new BadRequestException('You cannot delete Your self');
      }
      const response = await this.repository.softDataDelete({
        id: this.entity.id,
      });
      if (response.affected === 1) {
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  async GetUser() {
    try {
      const user = await this.userviewrepo.findOneByConditions({
        id: this.entity.id,
      });
      if (user) {
        const formatted = this.userData(user, true);
        return formatted;
      }
      return {} as UserDataView;
    } catch (error) {
      throw error;
    }
  }

  async ResetUserPassword() {
    try {
      const user = await this.repository.findOneBy({ id: this.entity.id });
      if (!user) {
        throw new BadRequestException('No user found');
      }
      if (user.adminCreated === 1) {
        user.adminCreated = 0;
      }
      const oldpassword = await bcrptjs.compare(
        this.entity.password,
        user.password,
      );
      if (oldpassword) {
        throw new BadRequestException('Please change to a new password');
      }
      const hashedPassword = await bcrptjs.hash(this.entity.password, 10);
      user.password = hashedPassword;
      const response = await this.repository.FindOneAndUpdate(
        {
          id: this.entity.id,
        },
        { password: hashedPassword, adminCreated: user.adminCreated },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  private async sendVerificationEmail(
    user: User,
    link: string,
    additionalhtml: string | string[] = '',
  ) {
    const emailData = {
      recipientName: user.firstname + ' ' + user.lastname,
      serverData: 'Please confirm registration',
      senderName: 'RC-TECH',
      body: link,
      moredata: [...additionalhtml],
    };
    const mailoptions: NotifyTypes = {
      type: 'email',
      payload: {
        to: [{ to: user.email, priority: PRIORITY_TYPES.HIGH }],
        subject: 'Welcome to RC-TECH please confirm your email',
        template: EmailTemplates.VERIFY_EMAIL,
        context: emailData,
      },
    };
    return this.client.send(NOTIFICATION_PATTERN.NOTIFY, mailoptions);
  }
}
