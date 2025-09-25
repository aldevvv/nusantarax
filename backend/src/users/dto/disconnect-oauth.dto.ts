import { IsEnum, IsNotEmpty } from 'class-validator';
import { Provider } from '@prisma/client';

export class DisconnectOAuthDto {
  @IsNotEmpty({ message: 'Provider is required' })
  @IsEnum(Provider, { message: 'Provider must be GITHUB or GOOGLE' })
  provider: Provider;
}