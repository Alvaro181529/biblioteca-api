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
    message:
      'La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número',
  })
  currentPassword: string;
  @IsNotEmpty({ message: 'LA contraseña no puede estar vacio' })
  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe contar minimo con 8 caracteres',
  })
  @MaxLength(20)
  @Matches(/(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])/, {
    message:
      'La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número',
  })
  newPassword: string;
  @IsNotEmpty({ message: 'LA contraseña no puede estar vacio' })
  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe contar minimo con 8 caracteres',
  })
  @MaxLength(20)
  @Matches(/(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])/, {
    message:
      'La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número',
  })
  confirmedPassword: string;
}
