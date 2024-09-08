import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UserSignInDto {
  @IsNotEmpty({ message: 'El correo no puede estar vacio' })
  @IsEmail({}, { message: 'Porfavor ingresa un correo valido' })
  email: string;
  @IsNotEmpty({ message: 'La contraseña no puede estar vacio' })
  @MinLength(8, {
    message: 'La contraseña debe contar minimo con 8 caracteres',
  })
  password: string;
}
