import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorEntity } from './entities/author.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginacionService } from 'src/pagination/pagination.service';
import { BookEntity } from 'src/books/entities/book.entity';
import { MemcachedService } from 'src/memcached/memcached.service';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(AuthorEntity)
    private readonly authorRepository: Repository<AuthorEntity>,
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
    private readonly paginacionService: PaginacionService,
    private readonly memcachedService: MemcachedService,
  ) { }

  async create(createAuthorDto: CreateAuthorDto): Promise<AuthorEntity> {
    const author = this.authorRepository.create(createAuthorDto);
    author.author_name = author.author_name.toLocaleUpperCase();
    if (!author.author_biografia) {
      author.author_biografia = 'SIN DESCRIPCION';
    }
    await this.memcachedService.flushCache();
    return await this.authorRepository.save(author);
  }
  async searchAuthors(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    const search = searchTerm.toLowerCase();
    const cacheKey = `author_search_${page}_${pageSize}_${searchTerm.toLowerCase().replace(/\s+/g, '_')}`;

    const start = performance.now();

    const cachedResult = await this.memcachedService.getCache(cacheKey);
    if (cachedResult) {
      const end = performance.now();
      // console.log(`Database query took ${end - start} milliseconds`);
      return cachedResult;
    }
    const [data, total] = await this.authorRepository
      .createQueryBuilder('authors')
      .leftJoinAndSelect('authors.books', 'book') // Unir con los libros asociados
      .where(
        `similarity(unaccent(authors.author_name), unaccent(:searchTerm)) > 0.3 `,
        {
          searchTerm: `%${search}%`,
        },
      )
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const paginatedResult = this.paginacionService.paginate(
      data,
      page,
      pageSize,
      total,
    );
    await this.memcachedService.setCache(cacheKey, paginatedResult);
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
    const cacheKey = `author_list_${page}_${pageSize}_${name.toLowerCase().replace(/\s+/g, '_')}`;

    const start = performance.now();

    const cachedResult = await this.memcachedService.getCache(cacheKey);
    if (cachedResult) {
      const end = performance.now();
      // console.log(`Database query took ${end - start} milliseconds`);
      return cachedResult;
    }
    const search = name.toLocaleLowerCase();
    const query = this.authorRepository.createQueryBuilder('authors');
    if (search) {
      query.where(
        `similarity(unaccent(authors.author_name), unaccent(:searchTerm)) > 0.3 `,
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
    this.memcachedService.setCache(cacheKey, paginatedResult);
    return {
      data: paginatedResult.data,
      total: paginatedResult.total,
      currentPage: paginatedResult.currentPage,
      totalPages: paginatedResult.totalPages,
      range: paginatedResult.range,
    };
  }

  async findOne(id: number): Promise<AuthorEntity> {
    const cacheKey = `author_${id}`;

    const start = performance.now();

    const cachedResult = await this.memcachedService.getCache(cacheKey);
    if (cachedResult) {
      const end = performance.now();
      // console.log(`Database query took ${end - start} milliseconds`);
      return cachedResult;
    }
    const author = await this.authorRepository.findOne({
      where: {
        id,
      },
      select: {
        author_name: true,
        author_biografia: true,
      },
    });

    if (!author) throw new NotFoundException(`Author with ID ${id} not found`);
    this.memcachedService.setCache(cacheKey, author);
    return author;
  }

  async update(
    id: number,
    updateAuthorDto: UpdateAuthorDto,
  ): Promise<AuthorEntity> {
    const author = await this.authorRepository.findOne({
      where: {
        id,
      },
    });
    if (!author) throw new NotFoundException(`Author with ID ${id} not found`);
    Object.assign(author, updateAuthorDto);
    author.author_name = author.author_name.toLocaleUpperCase();
    if (!author.author_biografia) author.author_biografia = 'SIN DESCRIPCION';
    try {
      await this.memcachedService.flushCache();
      return await this.authorRepository.save(author);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating the category: ' + error.message,
      );
    }
  }

  async remove(id: number): Promise<{
    author: AuthorEntity;
    message: string;
  }> {
    const author = await this.authorRepository.findOne({ where: { id } });
    const bookCount = await this.bookRepository.count({
      where: {
        book_authors: {
          id,
        },
      },
    });
    if (bookCount > 0)
      throw new InternalServerErrorException(
        'Cannot delete author because it is associated with one or more books',
      );
    try {
      const info = await this.authorRepository.remove(author);
      await this.memcachedService.flushCache();
      return { author: info, message: 'Author deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting the author: ' + error.message,
      );
    }
  }
}
