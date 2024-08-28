import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Matches,
} from 'class-validator';
import { format, isBefore, isEqual } from 'date-fns';

@ValidatorConstraint({ name: 'eitherUserIdOrGroupId', async: false })
class EitherUserIdOrGroupIdConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const object = args.object as any;
    const hasUserId = !!object.userId;
    const hasGroupId = !!object.groupId;

    if (!hasUserId && !hasGroupId) {
      return true;
    }

    // Ensure that either userId or groupId is provided, but not both.
    return (hasUserId || hasGroupId) && !(hasUserId && hasGroupId);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Either userId or groupId must be provided, but not both.';
  }
}

@ValidatorConstraint({ name: 'validateDate', async: false })
class ValidateDate implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const object = args.object as LinkRoleDTO;
    const date = object.expireDate;
    const isLessThanNow = isBefore(date, new Date());
    const isNow = isEqual(date, new Date());
    return !isLessThanNow && !isNow;
  }

  defaultMessage(args: ValidationArguments) {
    return `Expire date must be greater than ${format(new Date(), 'yyyy-MM-dd HH:mm')}`;
  }
}

export class LinkRoleDTO {
  @IsOptional()
  @IsNotEmpty({ message: 'userId cannot be empty' })
  userId: string;

  @IsOptional()
  @IsNotEmpty({ message: 'groupId cannot be empty' })
  groupId: string;

  @IsOptional()
  @IsNotEmpty()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/, {
    message: 'Expire date must be in the format YYYY-MM-DD HH:MM:SS',
  })
  expireDate: Date | null;
  @Validate(EitherUserIdOrGroupIdConstraint)
  validateEitherUserIdOrGroupId: boolean;
  @Validate(ValidateDate)
  validatedate: boolean;
}
