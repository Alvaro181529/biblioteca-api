import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';

export class UserSignInDto {
  @IsNotEmpty({ message: 'El correo no puede estar vacio' })
  @IsEmail({}, { message: 'Porfavor ingresa un correo valido' })
  email: string;
  @IsOptional()
  active: boolean;
  @IsNotEmpty({ message: 'La contraseña no puede estar vacio' })
  @Matches(/(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])/, {
    message:
      'La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número',
  })
  @MinLength(8, {
    message: 'La contraseña debe contar minimo con 8 caracteres',
  })
  password: string;
}
