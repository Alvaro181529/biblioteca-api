import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Roles } from '../utilities/common/user-role.enum';
import { IsEnum } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEnum(Roles, {
    each: true,
    message: 'Book condition must be a valid condition',
  })
  rols?: Roles;
}
