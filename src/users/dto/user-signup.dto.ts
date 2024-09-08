import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserSignInDto } from './user-signin.dto';
import { Roles } from '../utilities/common/user-role.enum';

export class UserSignUpDto extends UserSignInDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @IsString({ message: 'El nombre solo deve ser texto' })
  name: string;
  @IsOptional()
  @IsEnum(Roles, {
    each: true,
    message: 'Book condition must be a valid condition',
  })
  rols?: Roles;
}
