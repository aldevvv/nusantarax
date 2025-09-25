import { IsString, MinLength, Matches } from 'class-validator';
import { Match } from '../../auth/decorators/match.decorator';

export class SetPasswordDto {
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, number/special character',
  })
  password: string;

  @IsString({ message: 'Confirm password must be a string' })
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}