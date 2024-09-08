import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserSignUpDto } from './dto/user-signup.dto';
import { hash, compare } from 'bcrypt';
import { UserSignInDto } from './dto/user-signin.dto';
import { sign } from 'jsonwebtoken';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterEntity } from 'src/registers/entities/register.entity';
import { Roles } from './utilities/common/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(RegisterEntity)
    private registerRepository: Repository<RegisterEntity>,
  ) {}

  async signup(userSignUpDto: UserSignUpDto): Promise<UserEntity> {
    const register = new RegisterEntity();
    const newRegister = await this.registerRepository.save(register);
    const userExist = await this.findUserByEmail(userSignUpDto.email);
    if (userExist) throw new BadRequestException('El correo no es disponible');
    if (userSignUpDto.email.includes('@coplumu'))
      userSignUpDto.rols = Roles.ESTUDENT;
    userSignUpDto.name = userSignUpDto.name.toUpperCase();
    userSignUpDto.password = await hash(userSignUpDto.password, 10);
    let user = this.usersRepository.create(userSignUpDto);
    user.register = newRegister;
    user = await this.usersRepository.save(user);
    delete user.password;
    return user;
  }

  async signin(userSignInDto: UserSignInDto): Promise<UserEntity> {
    const userExist = await this.usersRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.email=:email', { email: userSignInDto.email })
      .getOne();
    if (
      !userExist ||
      !(await compare(userSignInDto.password, userExist.password))
    )
      throw new BadRequestException('Correo o contraseña equivocada');
    delete userExist.password;
    return userExist;
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find({ relations: { register: true } });
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    // user.rols = user.rols.toLocaleUpperCase();
    updateUserDto.name = updateUserDto.name.toLocaleUpperCase();
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { register: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.usersRepository.delete(id);
    await this.registerRepository.remove(user.register);
    return { deletedUser: user, status: 'User delated' };
  }

  async findUserByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async accessToken(user: UserEntity): Promise<string> {
    return sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME },
    );
  }
}
