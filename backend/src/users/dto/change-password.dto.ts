import { IsString, MinLength, IsNotEmpty, Matches } from 'class-validator';
import { Match } from '../../auth/decorators/match.decorator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString({ message: 'Current password must be a string' })
  currentPassword: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'New password must contain uppercase, lowercase, number/special character',
  })
  newPassword: string;

  @IsString({ message: 'Confirm password must be a string' })
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword: string;
}