import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString({ message: 'Full name must be a string' })
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  fullName: string;
}