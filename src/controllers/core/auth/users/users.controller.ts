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
import { UserService } from '../../../../services/core/auth/users/users.service';
import { JoiValidator } from 'src/app/context/interceptors/joi.interceptor';
import {
  AddRoleSchema,
  LoginSchema,
  ResetSchema,
  UserRegisterSchema,
} from 'src/schemas/core/user.schema';
import {
  addrolestype,
  registertype,
} from '../../../../services/core/auth/users/users.types';
import { Request, Response } from 'express';

import { EventsGateway } from 'src/events/event.gateway';
import {
  EMailGuard,
  JwtGuard,
  RefreshTokenGuard,
  RolesGuard,
} from '../../../../services/core/auth/authguards/authguard.guard';
import { Role, Roles } from 'src/app/decorators/roles.decorator';
import { Schemas } from 'src/app/decorators/schema.decorator';
import { Paginate } from 'src/app/decorators/pagination.decorator';
import { UserUtilsService } from 'src/services/core/auth/users/user.utils.service';
import { Decrypt } from 'src/app/decorators/decrypt.decorator';
import { IController } from 'src/controllers/controller.interface';
import { Permissions } from 'src/app/decorators/permissions.decorator';
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
} from 'src/swagger/controllers/core/usercontroller';
import { FileInterceptor } from '@nestjs/platform-express';
import { RTechNotifier } from '@notify/rtechnotifier';

@ApiTags('User Management')
@Controller('/core/auth/user')
export class UsersController extends IController<UserService> {
  constructor(
    model: UserService,
    private readonly userutils: UserUtilsService,
    @Inject(EventsGateway) private readonly socket: EventsGateway,
    private notify: RTechNotifier,
  ) {
    super(model);
  }

  @Post('/register')
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
  @LoginUserDocs()
  @Schemas({ schemas: [LoginSchema], type: 'body' })
  public async LoginUser(@Res() res: Response) {
    try {
      const user = await this.model.UserLogin();
      this.socket.server.emit('login', { userId: user.id });
      res.status(200).json(user);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtGuard, EMailGuard, RefreshTokenGuard)
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

  @UseGuards(JwtGuard, EMailGuard, RolesGuard)
  @Post('/roles')
  @AddRolesDocs()
  @UseInterceptors(new JoiValidator(AddRoleSchema, 'body'))
  @Roles(Role.ADMIN)
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

  @UseGuards(JwtGuard, EMailGuard, RolesGuard)
  @Delete('/roles')
  @RemoveRolesDocs()
  @UseInterceptors(new JoiValidator(AddRoleSchema, 'body'))
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  @Permissions({ module: 'User Management', moduleLink: 'Users' })
  @UseGuards(JwtGuard, EMailGuard, RolesGuard)
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
  @Roles(Role.ADMIN)
  @Permissions({ module: 'User Management', moduleLink: 'Users' })
  @UseGuards(JwtGuard, EMailGuard, RolesGuard)
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
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtGuard, EMailGuard, RolesGuard)
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
  @UseGuards(JwtGuard, EMailGuard, RolesGuard)
  @Roles(Role.USER)
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
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtGuard, EMailGuard, RolesGuard)
  @Roles(Role.USER)
  async AddProfileImage(
    @Res() res: Response,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
            message: 'Image size should be less than or equal to 5mbs',
          }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    try {
      this.userutils.entity.id = req.user.id;
      const response = await this.userutils.AddUserProfileImage(image);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      throw error;
    }
  }
}
