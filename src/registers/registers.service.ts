import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterEntity } from './entities/register.entity';
import { In, Repository } from 'typeorm';
import { InstrumentEntity } from 'src/instruments/entities/instrument.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { BookEntity } from 'src/books/entities/book.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class RegistersService {
  constructor(
    @InjectRepository(RegisterEntity)
    private readonly registerRepository: Repository<RegisterEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(InstrumentEntity)
    private readonly instrumentRepository: Repository<InstrumentEntity>,
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
  ) {}

  async findOne(user: UserEntity) {
    if (!user || !user.id) {
      throw new NotFoundException('User not found. Please log in.');
    }
    const register = await this.registerRepository.findOne({
      where: { id: user.register.id },
    });
    return register;
  }
  async update(
    updateRegisterDto: UpdateRegisterDto,
    user: UserEntity,
  ): Promise<RegisterEntity> {
    if (!user || !user.id) throw new NotFoundException('User not found');
    const id = user.register.id;
    const register = await this.findRegisterById(id);
    this.assignUpdatedProperties(register, updateRegisterDto);
    if (updateRegisterDto.register_intrument?.length > 0) {
      register.register_intrument = await this.findInstrumentsByIds(
        updateRegisterDto.register_intrument,
      );
    }
    if (updateRegisterDto.register_category?.length > 0) {
      register.register_category = await this.findCategoriesByIds(
        updateRegisterDto.register_category,
      );
    }

    return this.saveRegister(register);
  }

  private async findRegisterById(id: number): Promise<RegisterEntity> {
    const register = await this.registerRepository.findOne({
      where: { id },
      relations: ['register_category', 'register_intrument'],
    });
    if (!register) {
      throw new NotFoundException(`Register with ID ${id} not found.`);
    }
    return register;
  }

  private assignUpdatedProperties(
    register: RegisterEntity,
    updateRegisterDto: UpdateRegisterDto,
  ): void {
    Object.assign(register, updateRegisterDto);
  }

  private async findInstrumentsByIds(
    ids: number[],
  ): Promise<InstrumentEntity[]> {
    const instruments = await this.instrumentRepository.findBy({
      id: In(ids),
    });
    if (instruments.length !== ids.length) {
      throw new InternalServerErrorException('Some instruments not found.');
    }
    return instruments;
  }

  private async findCategoriesByIds(ids: number[]): Promise<CategoryEntity[]> {
    const categories = await this.categoryRepository.findBy({
      id: In(ids),
    });
    if (categories.length !== ids.length) {
      throw new InternalServerErrorException('Some categories not found.');
    }
    return categories;
  }

  private async saveRegister(
    register: RegisterEntity,
  ): Promise<RegisterEntity> {
    try {
      return await this.registerRepository.save(register);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating the register: ' + error.message,
      );
    }
  }
}
