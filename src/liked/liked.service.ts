import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookEntity } from 'src/books/entities/book.entity';
import { UpdateRegisterDto } from 'src/registers/dto/update-register.dto';
import { RegisterEntity } from 'src/registers/entities/register.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class LikedService {
  constructor(
    @InjectRepository(RegisterEntity)
    private readonly registerRepository: Repository<RegisterEntity>,
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
  ) {}
  async findAll(
    user: UserEntity,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    if (!user || !user.id) throw new NotFoundException('User not found');
    const userId = user.id;
    const data = await this.registerRepository.find({
      where: { register_user: { id: userId } },
      select: { register_liked: true },
    });
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const allLikedItems = data.flatMap((item) => item.register_liked);
    const total = allLikedItems.length;

    const paginatedLikedItems = allLikedItems.slice(skip, skip + take);
    return {
      data: paginatedLikedItems,
      total,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async update(id: number, updateRegisterDto: UpdateRegisterDto) {
    const register = await this.registerRepository.findOne({
      where: { register_user: { id } },
    });
    if (!register) {
      throw new NotFoundException(`Register with ID ${id} not found.`);
    }
    Object.assign(register, updateRegisterDto);
    if (
      updateRegisterDto.register_liked &&
      updateRegisterDto.register_liked.length > 0
    ) {
      const book = await this.bookRepository.findBy({
        id: In(updateRegisterDto.register_liked),
      });
      if (book.length !== updateRegisterDto.register_liked.length) {
        throw new InternalServerErrorException('Some instruments not found.');
      }
      register.register_liked = book;
    }
    await this.registerRepository.save(register);
    return { register_liked: register.register_liked };
  }
}
