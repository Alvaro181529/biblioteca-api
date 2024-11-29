import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Roles } from '../utilities/common/user-role.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEnum(Roles, {
    each: true,
    message: 'Necesita el rol',
  })
  rols?: Roles;
}
