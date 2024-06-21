import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
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

@Controller('/core/auth/user')
export class UsersController {
  constructor(
    private readonly model: UserService,
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

  @Get('')
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
}
