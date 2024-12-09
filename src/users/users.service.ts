import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserSignUpDto } from './dto/user-signup.dto';
import { hash, compare } from 'bcrypt';
import { UserSignInDto } from './dto/user-signin.dto';
import { sign, verify } from 'jsonwebtoken';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterEntity } from 'src/registers/entities/register.entity';
import { Roles } from './utilities/common/user-role.enum';
import { PaginacionService } from 'src/pagination/pagination.service';
import { BookEntity } from 'src/books/entities/book.entity';
import { UpdatePasswordDto } from './dto/update-password';
import { OrderEntity } from 'src/orders/entites/order.entity';
import { OrderStatus } from 'src/orders/utilities/common/order-status.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
    @InjectRepository(RegisterEntity)
    private registerRepository: Repository<RegisterEntity>,
    private readonly paginacionService: PaginacionService,
  ) {}

  async signup(userSignUpDto: UserSignUpDto): Promise<UserEntity> {
    const register = new RegisterEntity();
    const count = await this.usersRepository.count();
    if (!count) {
      userSignUpDto.rols = Roles.ROOT;
    }
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

  async recomendations(user?: UserEntity) {
    if (!user) return;
    const books = this.bookRepository.find({
      take: 5,
    });
    return books;
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
      .where('users.email=:email and users.active=:active', {
        email: userSignInDto.email,
        active: true,
      })
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
    type: string = 'true',
  ): Promise<any> {
    const search = query ? query.toLowerCase() : '';
    const Query = this.usersRepository.createQueryBuilder('user');
    if (query) {
      Query.andWhere(
        '(LOWER(user.name) LIKE :searchTerm OR LOWER(user.email) LIKE :searchTerm)',
        {
          searchTerm: `%${search}%`,
        },
      );
    }
    Query.leftJoinAndSelect('user.register', 'register');
    if (type !== '') {
      const isActive = type.toLowerCase() === 'true';
      Query.andWhere('user.active = :isActive', {
        isActive,
      });
    }
    const [data, total] = await Query.getManyAndCount();
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
    if (!user) throw new NotFoundException(`Usuario id ${id} no encontrado`);
    user.rols = user.rols;
    if (updateUserDto.password)
      updateUserDto.password = await hash(updateUserDto.password, 10);
    user.rols = updateUserDto.rols;
    updateUserDto.name = updateUserDto.name.toLocaleUpperCase();
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }
  async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, newPassword, confirmedPassword } =
      updatePasswordDto;
    const user = await this.usersRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.id=:id', { id: userId })
      .getOne();
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    const passwordMatch = await compare(currentPassword, user.password);
    if (!passwordMatch) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }
    if (newPassword !== confirmedPassword) {
      throw new BadRequestException('Las contraseñas nuevas no coinciden');
    }
    user.password = await hash(newPassword, 10);
    await this.usersRepository.save(user);

    return { message: 'Contraseña actualizada exitosamente' };
  }
  async remove(id: number, userEntity: UserEntity) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { register: true, orders: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const [orders, ordersCount] = await this.orderRepository.findAndCount({
      where: {
        user: { id: user.id },
        order_status: OrderStatus.PRESTADO,
      },
    });
    if (ordersCount > 0) {
      throw new BadRequestException({
        message: `No se puede eliminar la cuenta. El usuario tiene ${ordersCount} orden(es) asociada(s).`,
        orders: orders,
      });
    }
    if (userEntity.id == user.id)
      throw new BadRequestException('No se puede elimar el usuario actual');
    await this.orderRepository.remove(user.orders);
    await this.usersRepository.delete(id);
    await this.registerRepository.remove(user.register);
    return { user, status: 'User delated' };
  }
  async activate(id: number, userEntity: UserEntity) {
    if (
      !(
        userEntity.rols.includes(Roles.ADMIN) ||
        userEntity.rols.includes(Roles.ROOT)
      )
    ) {
      throw new BadRequestException('Usuario no autorizado');
    }

    const user = await this.usersRepository.findOne({
      where: { id: id },
    });
    if (!user) throw new BadRequestException('Usuario no encontrado');
    user.active = true;
    try {
      return this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Hubo un error: ', error);
    }
  }
  async desactivate(id: number, userEntity: UserEntity) {
    if (
      id !== userEntity.id &&
      !(
        userEntity.rols.includes(Roles.ADMIN) ||
        userEntity.rols.includes(Roles.ROOT)
      )
    )
      throw new BadRequestException('Usuario no autorizado');
    if (
      (userEntity.rols == 'ADMIN' || userEntity.rols == 'ROOT') &&
      id == userEntity.id
    ) {
      throw new BadRequestException('Usted no puede eliminarse');
    }
    const user = await this.usersRepository.findOne({
      where: { id: id || userEntity.id },
    });
    if (!user) throw new BadRequestException('Usuario no encontrado');
    user.active = false;
    try {
      return this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Hubo un error: ', error);
    }
  }
  async deleteAccount(id: number, userEntity: UserEntity) {
    if (!userEntity || !userEntity.id)
      throw new BadRequestException('Por favor inicie session');
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { register: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const [orders, ordersCount] = await this.orderRepository.findAndCount({
      where: { user: { id: user.id } },
    });
    if (ordersCount > 0) {
      throw new BadRequestException({
        message: `No se puede eliminar la cuenta. El usuario tiene ${ordersCount} orden(es) asociada(s).`,
        orders: orders,
      });
    }

    await this.usersRepository.delete(id);
    await this.registerRepository.remove(user.register);
    return { user, status: 'Userio eliminado' };
  }
  async me(userEntity: UserEntity) {
    if (!userEntity || !userEntity.id)
      throw new BadRequestException('Por favor iniciar session');
    const user = await this.usersRepository.findOne({
      where: { id: userEntity.id },
      relations: { register: true },
    });
    return user;
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
  async generateRefreshToken(user: UserEntity): Promise<string> {
    return sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME }, // 7 días, por ejemplo
    );
  }
  // Método para verificar y obtener un nuevo accessToken usando refreshToken
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET_KEY,
      ) as any;

      const user = await this.usersRepository.findOne({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new UnauthorizedException('Token inválido o expirado');
      }

      return await this.accessToken(user);
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado ' + error);
    }
  }
}
