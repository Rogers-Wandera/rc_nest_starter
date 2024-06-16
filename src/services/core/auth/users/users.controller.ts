import {
  Body,
  Controller,
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
import { LoginSchema, UserRegisterSchema } from 'src/schemas/core/user.schema';
import { registertype } from './users.types';
import { Request, Response } from 'express';
import { format } from 'date-fns';
import { EmailService } from 'src/app/mailer/mailer.service';
import { EventsGateway } from 'src/events/event.gateway';
import {
  VerifyEMailGuard,
  VerifyJwtGuard,
  VerifyRefreshTokenGuard,
} from '../authguards/authguard.guard';
import { RefreshTokenService } from '../refreshtokens/refreshtokens.service';

@Controller('/core/auth/user')
@UseFilters(new AllExceptionsFilter())
export class UsersController {
  constructor(
    private readonly model: UserService,
    @Inject(EventsGateway) private readonly socket: EventsGateway,
    private readonly emailService: EmailService,
    private readonly refreshtokens: RefreshTokenService,
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

  @UseGuards(VerifyJwtGuard, VerifyEMailGuard, VerifyRefreshTokenGuard)
  @Post('/refresh')
  async RefreshToken(@Res() res: Response, @Req() req: Request) {
    res.status(200).json({ user: req['user'] });
  }
}
