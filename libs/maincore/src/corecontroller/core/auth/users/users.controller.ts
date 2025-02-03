import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  AddRoleSchema,
  LoginSchema,
  ResetLinkSchema,
  ResetSchema,
  UserRegisterSchema,
} from '../../../schemas/core/user.schema';
import { Request, Response } from 'express';
import { Schemas } from '../../../../coretoolkit/decorators/schema.decorator';
import { Paginate } from '../../../../coretoolkit/decorators/pagination.decorator';
import { Decrypt } from '../../../../coretoolkit/decorators/decrypt.decorator';
import { IController } from '../../../controller.interface';
import { Permissions } from '../../../../coretoolkit/decorators/permissions.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  AddRolesDocs,
  DeleteUserDocs,
  GenerateVerificationDocs,
  GetUserDoc,
  GetUsersDocs,
  LoginUserDocs,
  RefreshTokenDocs,
  RegisterUserDocs,
  RemoveRolesDocs,
  ResetLinkDoc,
  ResetPasswordDoc,
  ResetUserPasswordDoc,
  UploadProfileDoc,
  VerifyUserDocs,
} from '../../../core/auth/users/users.swagger';
import { UserUtilsService } from '../../../../coreservices/services/auth/users/user.utils.service';
import { UserService } from '../../../../coreservices/services/auth/users/users.service';
import { EventsGateway } from '../../../../coretoolkit/events/event.gateway';
import { JoiValidator } from '../../../../coretoolkit/contexts/interceptors/joi.interceptor';
import { RefreshTokenGuard } from '../../../../authguards/guards/refresh.guard';
import { Roles } from '../../../../authguards/decorators/roles.guard';
import {
  addrolestype,
  registertype,
} from '../../../../coretoolkit/types/coretypes';
import { GUARDS, ROLE } from '../../../../coretoolkit/types/enums/enums';
import {
  AuthGuard,
  SkipAllGuards,
} from '../../../../authguards/guards/auth.guard';
import { SkipGuards } from '../../../../authguards/decorators/skip.guard';
import { UploadFile } from '../../../../coretoolkit/decorators/upload.decorator';
import {
  File,
  Service,
} from '../../../../coretoolkit/decorators/param.decorator';
import { ValidateService } from '../../../../coretoolkit/decorators/servicevalidate.decorator';
import { User } from '../../../../entities/core/users.entity';
import { CheckMicroService } from '../../../../coretoolkit/decorators/microservice.decorator';
import { Only } from '@core/maincore/authguards/decorators/only.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { ClassValidator } from '@core/maincore/coretoolkit/decorators/classvalidator.decorator';
import { LockUserDTO } from './users.dto';
import { ServerRouteRoleService } from '@core/maincore/coreservices/services/auth/serverrouteroles/serverrouteroles.service';

@ApiTags('User Management')
@Controller('/core/auth/users')
@AuthGuard(ROLE.ADMIN)
export class UsersController extends IController<UserService> {
  constructor(
    model: UserService,
    private readonly userutils: UserUtilsService,
    @Inject(EventsGateway) private readonly socket: EventsGateway,
    private serverroles: ServerRouteRoleService,
  ) {
    super(model);
  }

  @Post('/register')
  @CheckMicroService()
  @SkipAllGuards()
  @RegisterUserDocs()
  @UseInterceptors(new JoiValidator(UserRegisterSchema, 'body'))
  public async RegisterUser(@Body() body: registertype, @Res() res: Response) {
    try {
      const response = await this.model.createUser(body);
      res
        .status(HttpStatus.OK)
        .json({ msg: 'User created successfully', emailsent: response });
    } catch (error) {
      throw error;
    }
  }

  @Post('/verification/resend/:userId')
  @CheckMicroService()
  @GenerateVerificationDocs()
  @SkipAllGuards()
  async GenerateVerification(
    @Res() res: Response,
    @Param('userId', new ParseUUIDPipe()) id: string,
    @Query('admin') isAdmin: string,
  ) {
    try {
      this.userutils.entity.id = id;
      const response = await this.userutils.RegenerateActivation(isAdmin);
      res
        .status(HttpStatus.OK)
        .json({ msg: 'Verification Sent Successfully', emailsent: response });
    } catch (error) {
      throw error;
    }
  }

  @Post('/verification/verify/:userId/:token')
  @VerifyUserDocs()
  @SkipAllGuards()
  @Decrypt({ type: 'params', keys: ['userId', 'token'], decrypttype: 'uri' })
  async VerifyUser(
    @Res() res: Response,
    @Param('userId', new ParseUUIDPipe()) id: string,
    @Param('token') token: string,
  ) {
    try {
      this.userutils.entity.id = id;
      const response = await this.userutils.VerifyUser(token);
      const msg = response
        ? 'Verification has been successful'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }
  @Post('/login')
  @SkipAllGuards()
  @LoginUserDocs()
  @Schemas({ schemas: [LoginSchema], type: 'body' })
  public async LoginUser(@Res() res: Response) {
    try {
      const user = await this.model.UserLogin();
      res.status(200).json(user);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(RefreshTokenGuard)
  @SkipGuards(GUARDS.ROLES)
  @Post('/refresh')
  @RefreshTokenDocs()
  async RefreshToken(@Res() res: Response, @Req() req: Request) {
    try {
      this.model.entity.id = req.user.id;
      const token = await this.model.HandleRefreshToken();
      res
        .status(200)
        .json({ msg: 'Session updated successfully', data: token.token });
    } catch (error) {
      throw error;
    }
  }

  @Post('/roles')
  @Only(ROLE.ADMIN)
  @AddRolesDocs()
  @UseInterceptors(new JoiValidator(AddRoleSchema, 'body'))
  async AddRoles(
    @Body() body: addrolestype,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      this.model.entity.createdBy = req.user.id;
      const role = await this.model.addRole(body);
      this.socket.server.emit('loguserout', { userId: role.user.id });
      res.status(200).json({ msg: 'Role created successfully', data: role });
    } catch (error) {
      throw error;
    }
  }

  @Delete('/roles')
  @Only(ROLE.ADMIN)
  @RemoveRolesDocs()
  @UseInterceptors(new JoiValidator(AddRoleSchema, 'body'))
  async RemoveRoles(
    @Body() body: addrolestype,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      this.model.entity.deletedBy = req.user.id;
      await this.model.RemoveRole(body);
      this.socket.server.emit('loguserout', { userId: body.userId });
      res.status(200).json({ msg: 'Role deleted successfully', data: {} });
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @GetUsersDocs()
  @Only(ROLE.ADMIN)
  @Paginate()
  @SkipThrottle()
  @Permissions({ module: 'User Management', moduleLink: 'Users' })
  async GetUsers(@Res() res: Response) {
    try {
      const response = await this.model.ViewUsers();
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':userId')
  @Only(ROLE.ADMIN)
  @DeleteUserDocs()
  @Permissions({ module: 'User Management', moduleLink: 'Users' })
  async DeleteUser(
    @Res() res: Response,
    @Param('userId', new ParseUUIDPipe()) id: string,
  ) {
    try {
      this.model.entity.id = id;
      const response = await this.model.DeleteUser();
      const message = response
        ? 'User deleted successfully'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg: message });
    } catch (error) {
      throw error;
    }
  }

  @Get('view/:userId')
  @GetUserDoc()
  @Permissions({ module: 'User Management', moduleLink: 'Users' })
  @Roles(ROLE.USER)
  async GetUser(
    @Res() res: Response,
    @Param('userId', new ParseUUIDPipe()) id: string,
  ) {
    try {
      this.model.entity.id = id;
      const data = await this.model.GetUser();
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @Post('/resetlink')
  @CheckMicroService()
  @SkipAllGuards()
  @Schemas({ schemas: [ResetLinkSchema] })
  @ValidateService([
    {
      entity: User,
      type: 'body',
      field: (context) => {
        const request = context.switchToHttp().getRequest() as Request;
        const params = request.query as { admin?: string; userId?: string };
        if (params?.admin && Number(params?.admin) === 1) {
          request.body = { id: params?.userId, email: null };
          return 'id';
        }
        return 'email';
      },
    },
  ])
  @ResetLinkDoc()
  async ResetLink(
    @Res() res: Response,
    @Service('user') user: User,
    @Body() body: { id?: string; email: string },
  ) {
    try {
      this.userutils.entity = user;
      const response = await this.userutils.ResetPasswordLink(body.id);
      const msg = response
        ? `${
            body.id
              ? `Verification link has been sent to ${user.firstname} ${user.lastname} successfully`
              : 'Please Check your email for a password reset link'
          }`
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }

  @Post('/resetpassword/:userId/:token')
  @ResetPasswordDoc()
  @SkipAllGuards()
  @Schemas({ type: 'body', schemas: [ResetSchema] })
  @Decrypt({ type: 'params', keys: ['userId', 'token'], decrypttype: 'uri' })
  async ResetPassword(
    @Res() res: Response,
    @Param('userId', new ParseUUIDPipe()) id: string,
    @Param('token') token: string,
    @Body() body: { password: string },
  ) {
    try {
      this.userutils.entity.id = id;
      this.userutils.entity.password = body.password;
      await this.userutils.ResetUserPassword(token);
      res.status(HttpStatus.OK).json({
        msg: 'Your Password has been reset successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  @Post('/reset/:userId')
  @ResetUserPasswordDoc()
  @Schemas({ type: 'body', schemas: [ResetSchema] })
  @Roles(ROLE.USER)
  async ResetUserPassword(
    @Res() res: Response,
    @Param('userId', new ParseUUIDPipe()) id: string,
  ) {
    try {
      this.model.entity.id = id;
      const response = await this.model.ResetUserPassword();
      const msg = response
        ? 'Password has been reset successfully'
        : 'Something went wrong';

      res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }

  @Post('/profile')
  @UploadProfileDoc()
  @UploadFile({ type: 'single', source: 'image' })
  @Roles(ROLE.USER)
  async AddProfileImage(
    @Res() res: Response,
    @Req() req: Request,
    @File() image: Express.Multer.File,
  ) {
    try {
      this.userutils.entity.id = req.user.id;
      const response = await this.userutils.AddUserProfileImage(image);
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      throw error;
    }
  }

  @Patch('/lock/:userId')
  @Only(ROLE.ADMIN)
  @ValidateService({ entity: User })
  @ClassValidator({ classDTO: LockUserDTO })
  async LockUser(@Body() body: LockUserDTO, @Service('user') user: User) {
    try {
      this.model.entity = user;
      const response = await this.model.LockUser(body);
      return { msg: response };
    } catch (error) {
      throw error;
    }
  }

  @Get('/userpermissions/:userId')
  @Roles(ROLE.USER)
  async UserPermissions(@Param('userId', new ParseUUIDPipe()) userId: string) {
    try {
      const permissions = await this.serverroles.getUserPermissions(userId);
      return permissions;
    } catch (error) {
      throw error;
    }
  }
}
