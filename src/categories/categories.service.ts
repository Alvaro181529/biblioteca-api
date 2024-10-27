import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginacionService } from 'src/pagination/pagination.service';
import { BookEntity } from 'src/books/entities/book.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
    private readonly paginacionService: PaginacionService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    const category = this.categoryRepository.create(createCategoryDto);
    category.category_name = category.category_name.toLocaleUpperCase();
    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating the category: ' + error.message,
      );
    }
  }

  async searchCategories(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    const search = searchTerm.toLowerCase();

    const [data, total] = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.books', 'book') // Unir con los libros asociados
      .where(
        `similarity(unaccent(category.category_name), unaccent(:searchTerm)) > 0.3 `,
        {
          searchTerm: `%${search}%`,
        },
      )
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

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    name: string = '',
  ): Promise<any> {
    const search = name.toLocaleLowerCase();
    const query = this.categoryRepository.createQueryBuilder('category');

    if (search) {
      query.where(
        `similarity(unaccent(category.category_name), unaccent(:searchTerm)) > 0.3 `,
        {
          searchTerm: `%${search}%`,
        },
      );
    }

    const [data, total] = await query.getManyAndCount();
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

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      select: {
        category_name: true,
        category_description: true,
        books: true,
      },
    });
    if (!category)
      throw new NotFoundException(`Category with ID ${id} not found`);
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category)
      throw new NotFoundException(`Category with ID ${id} not found.`);
    Object.assign(category, updateCategoryDto);
    category.category_name = category.category_name.toLocaleUpperCase();
    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating the category: ' + error.message,
      );
    }
  }

  async remove(id: number): Promise<any> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category)
      throw new NotFoundException(`Category with ID ${id} not found`);
    const bookCount = await this.bookRepository.count({
      where: {
        book_category: {
          id,
        },
      },
    });
    if (bookCount > 0)
      throw new InternalServerErrorException(
        'Cannot delete category because it is associated with one or more books',
      );

    try {
      const info = await this.categoryRepository.remove(category);
      return { category: info, message: 'Category deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting the category: ' + error.message,
      );
    }
  }
}
