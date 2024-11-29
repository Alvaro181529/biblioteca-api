import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  //   @Matches(/(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])/, {
  //     message: 'Password too weak',
  //   })
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  newPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  confirmedPassword: string;
}
