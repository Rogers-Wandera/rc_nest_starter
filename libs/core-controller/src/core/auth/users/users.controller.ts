import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpStatus,
  Inject,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  AddRoleSchema,
  LoginSchema,
  ResetSchema,
  UserRegisterSchema,
} from '../../../schemas/core/user.schema';
import { Request, Response } from 'express';
import { Schemas } from '@toolkit/core-toolkit/decorators/schema.decorator';
import { Paginate } from '@toolkit/core-toolkit/decorators/pagination.decorator';
import { Decrypt } from '@toolkit/core-toolkit/decorators/decrypt.decorator';
import { IController } from '@controller/core-controller/controller.interface';
import { Permissions } from '@toolkit/core-toolkit/decorators/permissions.decorator';
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
} from '@controller/core-controller/swagger/controllers/core/usercontroller';
import { FileInterceptor } from '@nestjs/platform-express';
import { lastValueFrom } from 'rxjs';
import { UserUtilsService } from '@services/core-services/services/auth/users/user.utils.service';
import { UserService } from '@services/core-services/services/auth/users/users.service';
import { EventsGateway } from '@toolkit/core-toolkit/events/event.gateway';
import { RabbitMQService } from '@toolkit/core-toolkit/micro/microservices/rabbitmq.service';
import { JoiValidator } from '@toolkit/core-toolkit/contexts/interceptors/joi.interceptor';
import { JwtGuard } from '@auth/auth-guards/guards/jwt.guard';
import { EMailGuard } from '@auth/auth-guards/guards/email.guard';
import { RefreshTokenGuard } from '@auth/auth-guards/guards/refresh.guard';
import { RolesGuard } from '@auth/auth-guards/guards/roles.guard';
import { Roles } from '@auth/auth-guards/decorators/roles.guard';
import {
  addrolestype,
  registertype,
} from '@toolkit/core-toolkit/types/coretypes';
import {
  GUARDS,
  NOTIFICATION_PATTERN,
  ROLE,
} from '@toolkit/core-toolkit/types/enums/enums';
import { AuthGuard, SkipAllGuards } from '@auth/auth-guards/guards/auth.guard';
import { SkipGuards } from '@auth/auth-guards/decorators/skip.guard';
import { UploadFile } from '@toolkit/core-toolkit/decorators/upload.decorator';
import { File } from '@toolkit/core-toolkit/decorators/param.decorator';

@ApiTags('User Management')
@Controller('/core/auth/user')
@AuthGuard(ROLE.ADMIN)
export class UsersController extends IController<UserService> {
  constructor(
    model: UserService,
    private readonly userutils: UserUtilsService,
    @Inject(EventsGateway) private readonly socket: EventsGateway,
    private readonly rabbitService: RabbitMQService,
  ) {
    super(model);
  }

  @Post('/register')
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
  @GenerateVerificationDocs()
  @SkipAllGuards()
  async GenerateVerification(
    @Res() res: Response,
    @Param('userId', new ParseUUIDPipe()) id: string,
  ) {
    try {
      this.model.entity.id = id;
      const response = await this.userutils.RegenerateActivation();
      res
        .status(HttpStatus.OK)
        .json({ msg: 'Verification Sent Successfully', emailsent: response });
    } catch (error) {
      throw error;
    }
  }

  @Get('/verification/verify/:userId/:token')
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
      this.socket.server.emit('login', { userId: user.id });
      await lastValueFrom(
        this.rabbitService.emit(NOTIFICATION_PATTERN.USER_LOGGED_IN, {
          userId: user.id,
        }),
      );
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
  @Paginate()
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

  @Post('/resetlink/:userId')
  @SkipAllGuards()
  @ResetLinkDoc()
  async ResetLink(
    @Res() res: Response,
    @Param('userId', new ParseUUIDPipe()) id: string,
  ) {
    try {
      this.userutils.entity.id = id;
      const response = await this.userutils.ResetPasswordLink();
      const msg = response
        ? 'Please check Check your email for a password reset link'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }

  @Get('/resetpassword/:userId/:token')
  @ResetPasswordDoc()
  @SkipAllGuards()
  @Decrypt({ type: 'params', keys: ['userId', 'token'], decrypttype: 'uri' })
  async ResetPassword(
    @Res() res: Response,
    @Param('userId', new ParseUUIDPipe()) id: string,
    @Param('token') token: string,
  ) {
    try {
      this.userutils.entity.id = id;
      const response = await this.userutils.ResetUserPassword(token);
      res.status(HttpStatus.OK).json({
        msg: 'You will be redirected to the reset page',
        data: {
          link: '/dashboard/core/auth/user/resetpassword',
          tempToken: response.token.token,
        },
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
}
