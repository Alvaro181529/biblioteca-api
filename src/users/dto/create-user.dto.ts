import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserSignInDto } from './user-signin.dto';

export class CreateUserDto extends UserSignInDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @IsString({ message: 'El nombre solo debe ser texto' })
  name: string;
  @IsOptional()
  active: boolean;
}
