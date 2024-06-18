import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AllExceptionsFilter } from 'src/app/context/exceptions/http-exception.filter';
import { UserService } from './users.service';
import { JoiValidator } from 'src/app/context/interceptors/joi.interceptor';
import {
  AddRoleSchema,
  LoginSchema,
  UserRegisterSchema,
} from 'src/schemas/core/user.schema';
import { addrolestype, registertype } from './users.types';
import { Request, Response } from 'express';
import { format } from 'date-fns';
import { EmailService } from 'src/app/mailer/mailer.service';
import { EventsGateway } from 'src/events/event.gateway';
import {
  EMailGuard,
  JwtGuard,
  RefreshTokenGuard,
  RolesGuard,
} from '../authguards/authguard.guard';
import { Roles } from 'src/app/decorators/roles.decorator';

@Controller('/core/auth/user')
@UseFilters(new AllExceptionsFilter())
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
  @UseInterceptors(new JoiValidator(LoginSchema, 'body'))
  public async LoginUser(@Body() body: registertype, @Res() res: Response) {
    try {
      this.model.entity.email = body.email;
      this.model.entity.password = body.password;
      this.model.entity.lastloginDate = format(
        new Date(),
        'yyyy-MM-dd HH:mm:ss',
      ) as unknown as Date;
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
  @Roles(['ADMIN'])
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
  @Roles(['ADMIN'])
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
}
