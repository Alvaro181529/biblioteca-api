import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty({ message: 'LA contraseña no puede estar vacio' })
  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe contar minimo con 8 caracteres',
  })
  @MaxLength(20)
  @Matches(/(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])/, {
    message: 'Password too weak',
  })
  currentPassword: string;
  @IsNotEmpty({ message: 'LA contraseña no puede estar vacio' })
  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe contar minimo con 8 caracteres',
  })
  @MaxLength(20)
  @Matches(/(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])/, {
    message: 'Password too weak',
  })
  newPassword: string;
  @IsNotEmpty({ message: 'LA contraseña no puede estar vacio' })
  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe contar minimo con 8 caracteres',
  })
  @MaxLength(20)
  @Matches(/(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])/, {
    message: 'Password too weak',
  })
  confirmedPassword: string;
}
