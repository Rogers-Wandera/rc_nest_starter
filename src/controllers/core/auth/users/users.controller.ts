import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
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

import { EmailService } from 'src/app/mailer/mailer.service';
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

@Controller('/core/auth/user')
export class UsersController {
  constructor(
    private readonly model: UserService,
    private readonly userutils: UserUtilsService,
    @Inject(EventsGateway) private readonly socket: EventsGateway,
    private readonly emailService: EmailService,
  ) {}
  @Post('/register')
  @UseInterceptors(new JoiValidator(UserRegisterSchema, 'body'))
  public async RegisterUser(@Body() body: registertype, @Res() res: Response) {
    try {
      let additionaldata: string | string[] = '';
      if (body.adminCreated == 1) {
        additionaldata = [`Please login using this password ${body.password}`];
      }
      const { user, token } = await this.model.createUser(body);
      const verify = `${process.env.BASE_URL}/verify?userId=${user.id}&token=${token}`;

      const response = await this.emailService.sendVerificationEmail(
        user,
        verify,
        additionaldata,
      );
      res
        .status(HttpStatus.OK)
        .json({ msg: 'User created successfully', emailsent: response });
    } catch (error) {
      throw error;
    }
  }

  @Post('/login')
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
  @Paginate()
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
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
}
