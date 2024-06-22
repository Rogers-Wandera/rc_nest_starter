import { BadRequestException, Inject } from '@nestjs/common';
import { User } from 'src/entity/core/users.entity';
import { EntityDataSource } from 'src/model/enity.data.model';
import { EntityModel } from 'src/model/entity.model';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/app/config/configuration';
import { addHours, format } from 'date-fns';
import { TokenService } from '../../system/tokens/tokens.service';
import { EmailService } from 'src/app/mailer/mailer.service';

export class UserUtilsService extends EntityModel<User> {
  constructor(
    @Inject(EntityDataSource) source: EntityDataSource,
    @Inject(ConfigService) private configservive: ConfigService<EnvConfig>,
    @Inject(TokenService) private readonly tokens: TokenService,
    private readonly emailService: EmailService,
  ) {
    super(User, source);
  }

  async ResetPasswordLink() {
    try {
      const user = await this.repository.findOneBy({ id: this.entity.id });
      if (!user) {
        throw new BadRequestException('No user found');
      }
      const token = crypto.randomBytes(64).toString('hex');
      const baseurl = this.configservive.get<string>('baseUrl');
      const url = `${baseurl}/core/auth/user/resetpassword/${this.encryptUrl(user.id)}/${this.encryptUrl(token)}`;
      const info = this.ResetMessage(user);
      const expireDate = addHours(new Date(), 1);
      this.tokens.entity.user = user;
      this.tokens.entity.expire = expireDate;
      this.tokens.entity.createdBy = user.id;
      this.tokens.entity.token = token;
      const emailData = {
        content: info,
        title: `Hello ${user.firstname}, Reset your password`,
        cta: true,
        btntext: 'Reset Password',
        url,
        email: user.email,
        subject: 'Reset Password',
      };
      const response = await this.emailService.SendWithMailer2(emailData);
      if (!response) {
        return false;
      }
      const res = await this.tokens.CreateToken();
      return res.id > 0;
    } catch (error) {
      throw error;
    }
  }

  ResetMessage(user: User) {
    const moreInfo = `
      <p>Hello, ${user.firstname} ${user.lastname}</p>
      <p>
        Your recieving this email because you requested a password reset. <br>
        Please note that the reset link expires in 1 hour
      </p>
      <p> If you did not request a password reset, please ignore this email.</p>`;
    return moreInfo;
  }

  async ResetUserPassword(token: string) {
    try {
      const user = await this.repository.findOneByConditions({
        id: this.entity.id,
      });
      if (!user) {
        throw new BadRequestException('No user found');
      }
      this.tokens.entity.user = user;
      this.tokens.entity.token = token;
      const usertoken = await this.tokens.CheckTokenExpiry();
      if (usertoken.isExpired) {
        throw new BadRequestException('The token has already expired');
      }
      return usertoken;
    } catch (error) {
      throw error;
    }
  }
}
