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
import { PaginacionService } from 'src/pagination/pagination.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(RegisterEntity)
    private registerRepository: Repository<RegisterEntity>,
    private readonly paginacionService: PaginacionService,
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

  async create(userSignUpDto: UserSignUpDto): Promise<UserEntity> {
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

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    query: string = '',
  ): Promise<any> {
    const search = query.toLowerCase();
    const [data, total] = await this.usersRepository
      .createQueryBuilder('user')
      .where(
        '(LOWER(user.name) LIKE :searchTerm OR LOWER(user.email) LIKE :searchTerm)',
        {
          searchTerm: `%${search}%`,
        },
      )
      .leftJoinAndSelect('user.register', 'register')
      .getManyAndCount();
    const paginatedResult = this.paginacionService.paginate(
      data,
      page,
      pageSize,
      total,
    );

    return {
      data: paginatedResult.data,
      total: paginatedResult.total,
      currentPage: paginatedResult.currentPage,
      totalPages: paginatedResult.totalPages,
      range: paginatedResult.range,
    };
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    user.rols = user.rols;
    updateUserDto.password = await hash(updateUserDto.password, 10);
    user.rols = updateUserDto.rols;
    updateUserDto.name = updateUserDto.name.toLocaleUpperCase();
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number, userEntity: UserEntity) {
    if (!userEntity || !userEntity.id)
      throw new BadRequestException('User not found. Please log in.');
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { register: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (userEntity.id == user.id)
      throw new BadRequestException('No se puede elimar el usuario actual');

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
