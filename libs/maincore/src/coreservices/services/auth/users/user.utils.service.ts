import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { User } from '../../../../entities/core/users.entity';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { EntityDataSource } from '../../../../databridge/model/enity.data.model';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { addHours } from 'date-fns';
import { TokenService } from '../../system/tokens/tokens.service';
import { MessagingService } from '../../../../coretoolkit/messaging/messaging.service';
import { UserProfileImageService } from '../userprofileimages/userprofileimages.service';
import { QueryFailedError } from 'typeorm';
import { RabbitMQService } from '../../../../coretoolkit/micro/microservices/rabbitmq.service';
import { NotifyTypes } from '../../../../coretoolkit/types/notification/notify.types';
import { EnvConfig } from '../../../../coretoolkit/config/config';
import {
  EmailTemplates,
  NOTIFICATION_PATTERN,
  PRIORITY_TYPES,
  TOKEN_TYPES,
} from '../../../../coretoolkit/types/enums/enums';
import { UserService } from './users.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserUtilsService extends EntityModel<User, string> {
  constructor(
    @Inject(EntityDataSource) source: EntityDataSource,
    @Inject(ConfigService) private configservive: ConfigService<EnvConfig>,
    @Inject(TokenService) private readonly tokens: TokenService,
    private readonly userprofiles: UserProfileImageService,
    private readonly messagingService: MessagingService,
    private readonly client: RabbitMQService,
    private readonly service: UserService,
  ) {
    super(User, source);
  }

  async ResetPasswordLink() {
    try {
      const checktoken = await this.tokens.FindOne({
        user: { id: this.entity.id },
        isActive: 1,
      });
      if (checktoken) {
        const expired = this.checkExpireDate(checktoken.expire);
        if (!expired) {
          throw new BadRequestException(
            'Please you still have an active reset token, check your mail',
          );
        }
      }
      const token = crypto.randomBytes(64).toString('hex');
      const baseurl = this.configservive.get<string>('frontUrl');
      const url = `${baseurl}/resetpassword/${this.encryptUrl(this.entity.id)}/${this.encryptUrl(token)}`;
      const info = this.ResetMessage(this.entity);
      const expireDate = addHours(new Date(), 1);
      this.tokens.entity.user = this.entity;
      this.tokens.entity.expire = expireDate;
      this.tokens.entity.createdBy = this.entity.id;
      this.tokens.entity.token = token;
      const emailData = {
        email: [{ to: this.entity.email, priority: PRIORITY_TYPES.HIGH }],
        subject: 'Reset Password',
        context: {
          body: info,
          title: `Hello ${this.entity.firstname}, Reset your password`,
          cta: true,
          btntext: 'Reset Password',
          url,
        },
      };
      const response = await this.messagingService.SendWithMailer2(emailData);
      if (!response) {
        return false;
      }
      this.tokens.entity.tokenType = TOKEN_TYPES.RESET;
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
      this.tokens.entity.tokenType = TOKEN_TYPES.RESET;
      const usertoken = await this.tokens.CheckTokenExpiry();
      if (usertoken.isExpired) {
        throw new BadRequestException('The token has already expired');
      }
      this.service.entity.id = this.entity.id;
      this.service.entity.password = this.entity.password;
      await this.service.ResetUserPassword();
      return usertoken;
    } catch (error) {
      throw error;
    }
  }

  async RegenerateActivation() {
    try {
      const user = await this.repository.findOne({
        where: { id: this.entity.id },
      });
      if (!user) {
        throw new Error('No user found');
      }
      if (user.verified === 1) {
        throw new BadRequestException('User already verified');
      }
      const baseurl = this.configservive.get<string>('frontUrl');
      this.tokens.entity.tokenType = TOKEN_TYPES.VERIFY;
      const token = await this.tokens.GetUserToken(user.id);
      const expired = this.checkExpireDate(token.expire);
      if (!expired) {
        throw new BadRequestException(
          'You still have an active token, please check your email for a verification link',
        );
      }
      const newtoken = require('crypto').randomBytes(64).toString('hex');
      const expireDate = addHours(new Date(), 1);
      const verify = `${baseurl}/verifyaccount/${this.encryptUrl(user.id)}/${this.encryptUrl(newtoken)}`;
      this.tokens.entity.token = newtoken;
      this.tokens.entity.user = user;
      this.tokens.entity.expire = expireDate;
      this.tokens.entity.createdBy = user.id;
      this.tokens.entity.tokenType = TOKEN_TYPES.VERIFY;
      await this.tokens.CreateToken();
      await this.sendVerificationEmail(user, verify);
      return `An email with verification link has been sent, please note it may take 1-2 minutes for the email to reach`;
    } catch (error) {
      throw error;
    }
  }

  async VerifyUser(token: string) {
    try {
      const user = await this.repository.findOne({
        where: { id: this.entity.id },
      });
      if (!user) {
        throw new Error('No user found');
      }
      if (user.verified === 1) {
        throw new BadRequestException('User already verified');
      }
      this.tokens.entity.user = user;
      this.tokens.entity.token = token;
      this.tokens.entity.tokenType = TOKEN_TYPES.VERIFY;
      const usertoken = await this.tokens.CheckTokenExpiry();
      if (usertoken.isExpired) {
        throw new BadRequestException(
          'The token has already expired, please generate new one',
        );
      }
      const results = await this.repository.FindOneAndUpdate(
        { id: user.id },
        { verified: 1 },
      );
      await this.tokens.DeactivateUserToken(user.id);
      return results;
    } catch (error) {
      throw error;
    }
  }

  async AddUserProfileImage(image: Express.Multer.File) {
    try {
      this.userprofiles.entity.user = this.entity;
      const response = await this.userprofiles.AddUserprofileimages(image);
      return response;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('userprofileimages')) {
          throw new BadRequestException(
            'The user can only have one profile image',
          );
        }
      }
      throw error;
    }
  }

  private async sendVerificationEmail(
    user: User,
    link: string,
    additionalhtml: string | string[] = '',
  ): Promise<string> {
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
    return lastValueFrom(
      this.client.send(NOTIFICATION_PATTERN.NOTIFY, mailoptions),
    );
  }
}
