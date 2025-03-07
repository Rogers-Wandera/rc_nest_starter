import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { User } from '../../../../entities/core/users.entity';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { EntityDataSource } from '../../../../databridge/model/enity.data.model';
import { v4 as uuid } from 'uuid';
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
import { UserDataView } from '../../../../entities/coreviews/userdata.view';
import { UserRolesView } from '../../../../entities/coreviews/userroles.view';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { RabbitMQService } from '../../../../coretoolkit/micro/microservices/rabbitmq.service';
import { NotifyTypes } from '../../../../coretoolkit/types/notification/notify.types';
import { CustomRepository } from '../../../../databridge/ormextender/customrepository';
import {
  EmailTemplates,
  INJECTABLES,
  NOTIFICATION_PATTERN,
  PRIORITY_TYPES,
  ROLE,
  TOKEN_TYPES,
  USER_EVENTS,
} from '../../../../coretoolkit/types/enums/enums';
import {
  addrolestype,
  registertype,
} from '../../../../coretoolkit/types/coretypes';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../../../coretoolkit/config/config';
import { EventsGateway } from '@core/maincore/coretoolkit/events/event.gateway';
import { LockUserDTO } from '@core/maincore/corecontroller/core/auth/users/users.dto';

@Injectable()
export class UserService extends EntityModel<User, string> {
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
    private configservice: ConfigService<EnvConfig>,
    private readonly eventgateway: EventsGateway,
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
    this.tokens.entity.tokenType = TOKEN_TYPES.VERIFY;
    await this.tokens.CreateToken();
    await this.roles.createRoles();
    const verify = `${this.configservice.get<string>('frontUrl')}/verifyaccount/${this.encryptUrl(user.id)}/${this.encryptUrl(token)}`;
    let additionaldata: string | string[] = '';
    if (data.adminCreated == 1) {
      additionaldata = [`Please login using this password ${data.password}`];
    }
    this.sendVerificationEmail(user, verify, additionaldata);
    return `An email with verification link has been sent, please note it may take 1-2 minutes for the email to reach`;
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
    const accessToken: string = await this.createAccessToken(user, roles);
    const refreshToken: string = await this.createRefreshToken(user, roles);
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

  private readonly jwtPayload = (user: UserDataView, roles: number[]) => {
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
      },
      sub: user.id,
    };
  };

  private createAccessToken(
    user: UserDataView,
    roles: number[],
  ): Promise<string> {
    const payload = this.jwtPayload(user, roles);
    return this.jwtService.signAsync(payload);
  }

  private createRefreshToken(
    user: UserDataView,
    roles: number[],
  ): Promise<string> {
    const payload = this.jwtPayload(user, roles);
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

  public getToken(user: UserDataView, roles: number[]): Promise<string> {
    return this.createAccessToken(user, roles);
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

      if (user.id === this.request.user.id) {
        const registeredroles = this.request.user.roles;
        const checkhasrole = registeredroles.includes(ROLE.MAIN);
        if (!checkhasrole) {
          throw new ForbiddenException(
            `You cannot add roles to yourself, contact main admin`,
          );
        }
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
        this.eventgateway.emitToClient(
          this.entity.id,
          USER_EVENTS.LOG_USER_OUT,
          {
            message: `Your account has been deleted, contact admin`,
          },
          () => {
            const emailData = {
              recipientName: user.firstname + ' ' + user.lastname,
              senderName: 'RC-TECH',
              body: `Hello ${user.firstname + ' ' + user.lastname}, We would like to inform you that your account has been deleted due to unkwown reason, 
               If you believe this was a mistake or need further assistance, please contact admin`,
            };
            const mailoptions: NotifyTypes = {
              type: 'email',
              payload: {
                to: [{ to: user.email, priority: PRIORITY_TYPES.HIGH }],
                subject: 'Account Deleted',
                template: EmailTemplates.MAILER_2,
                context: {
                  ...emailData,
                  title: 'Your account is deleted',
                  cta: true,
                  btntext: 'Contact Admin',
                  url: '#',
                },
              },
            };
            this.client.emit(NOTIFICATION_PATTERN.NOTIFY, mailoptions);
          },
        );
        const socketThere = this.eventgateway.getClients().has(this.entity.id);
        if (socketThere) {
          this.eventgateway.deleteClient(this.entity.id);
          const onlineUsers = Array.from(this.eventgateway.getClients().keys());
          this.eventgateway.emit(USER_EVENTS.ONLINE_USERS, onlineUsers);
        }
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
        this.roles.entity = {
          ...this.roles.entity,
          user: { ...this.roles.entity.user, id: user.id },
        };
        const roles = await this.roles.getUserRoles();
        const not_assigned = await this.systemroles.ViewNotAssigned(user.id);
        const formatted = this.userData(user, true);
        const isAdmin = await this.systemroles.CheckIsRole(
          ROLE.ADMIN,
          this.request.user.id,
        );
        const moreinfo = isAdmin
          ? {
              system_roles: {
                roles,
                unassigned: not_assigned,
              },
            }
          : { system_roles: { roles, unassigned: [] } };

        const userObject = {
          ...formatted,
          ...moreinfo,
        };
        return userObject;
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

      const token = await this.tokens.FindOne({
        user: { id: user.id },
        tokenType: TOKEN_TYPES.RESET,
        isActive: 1,
      });
      if (token) {
        this.tokens.entity.user = user;
        this.tokens.entity.tokenType = TOKEN_TYPES.RESET;
        this.tokens.entity.token = token.token;
        await this.tokens.DeactivateUserToken(user.id);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  private sendVerificationEmail(
    user: User,
    link: string,
    additionalhtml: string | string[] = '',
  ): string {
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
    this.client.emit(NOTIFICATION_PATTERN.NOTIFY, mailoptions);
    return 'Email sent';
  }

  async LockUser(data: LockUserDTO) {
    try {
      const response = await this.repository.FindOneAndUpdate(
        {
          id: this.entity.id,
        },
        { isLocked: data.isLocked },
      );
      if (data.isLocked == 1) {
        this.eventgateway.emitToClient(
          this.entity.id,
          USER_EVENTS.LOG_USER_OUT,
          {
            message: `Your account is locked, contact admin ${data?.reason?.length > 0 ? ', Reason: ' + data.reason : ''}`,
          },
          () => {
            const emailData = {
              recipientName: this.entity.firstname + ' ' + this.entity.lastname,
              serverData: 'Please confirm registration',
              senderName: 'RC-TECH',
              body: `Hello ${this.entity.firstname + ' ' + this.entity.lastname}, We would like to inform you 
            that your account has been locked due to ${data?.reason?.length > 0 ? data.reason : 'unkwown reason'}, 
            If you believe this was a mistake or need further assistance, please contact admin`,
            };
            const mailoptions: NotifyTypes = {
              type: 'email',
              payload: {
                to: [{ to: this.entity.email, priority: PRIORITY_TYPES.HIGH }],
                subject: 'Account Locked',
                template: EmailTemplates.MAILER_2,
                context: {
                  ...emailData,
                  title: 'Your account is locked',
                  cta: true,
                  btntext: 'Contact Admin',
                  url: '#',
                },
              },
            };
            this.client.emit(NOTIFICATION_PATTERN.NOTIFY, mailoptions);
          },
        );
      }
      return response
        ? this.entity.firstname +
            ' ' +
            this.entity.lastname +
            ` has been ${data.isLocked === 1 ? 'locked' : 'unlocked'}`
        : 'something went wrong';
    } catch (error) {
      throw error;
    }
  }
}
