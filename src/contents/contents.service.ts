import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContentsDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentEntity } from './entities/content.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BookEntity } from 'src/books/entities/book.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { PaginacionService } from 'src/pagination/pagination.service';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(ContentEntity)
    private readonly contentRepository: Repository<ContentEntity>,
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
    private readonly paginacionService: PaginacionService,
  ) {}
  async searchContent(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    const search = searchTerm.toLowerCase();

    const [data, total] = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.book', 'book') // Unir con los libros asociados
      .where(
        `similarity(unaccent(content.content_sectionTitle), unaccent(:searchTerm)) > 0.2`,
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

  async create(createContentsDto: CreateContentsDto): Promise<ContentEntity[]> {
    const { contents } = createContentsDto;

    const book = await this.bookRepository.findOne({
      where: { id: contents[0].book },
      relations: ['book_contents'],
    });

    if (!book) {
      throw new NotFoundException(
        `Book with ID ${contents[0].book} not found.`,
      );
    }

    try {
      const newContents: ContentEntity[] = [];
      for (const contentDto of contents) {
        const content = new ContentEntity();
        content.content_sectionTitle = contentDto.content_sectionTitle;
        content.content_pageNumber = contentDto.content_pageNumber;
        content.book = book;

        const newContent = await this.contentRepository.save(content);
        newContents.push(newContent);
      }

      book.book_contents = [...book.book_contents, ...newContents];
      await this.bookRepository.save(book);

      // Convert newContents to a plain object and remove the circular reference
      const result = plainToInstance(ContentEntity, newContents, {
        excludeExtraneousValues: true,
      });

      return result;
    } catch (error) {
      throw new BadRequestException('Failed to create contents.' + error);
    }
  }

  async findAll() {
    return await this.contentRepository.find();
  }

  async findOne(id: number) {
    const content = await this.contentRepository.findOne({
      where: { id: id },
      relations: { book: true },
    });
    if (!content)
      throw new NotFoundException(`Content with ID ${id} not found.`);
    return content;
  }

  async update(
    id: number,
    updateContentDto: UpdateContentDto,
  ): Promise<ContentEntity> {
    // Buscar el contenido a actualizar
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['book'], // Asegúrate de cargar la relación si necesitas actualizarla
    });
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found.`);
    }
    const {
      content_sectionTitle,
      content_pageNumber,
      book: bookId,
    } = updateContentDto;

    if (content_sectionTitle !== undefined) {
      content.content_sectionTitle = content_sectionTitle;
    }
    if (content_pageNumber !== undefined) {
      content.content_pageNumber = content_pageNumber;
    }
    if (bookId !== undefined) {
      const book = await this.bookRepository.findOne({
        where: { id: bookId },
      });
      if (!book) {
        throw new NotFoundException(`Book with ID ${bookId} not found.`);
      }
      content.book = book;
    }

    const updatedContent = await this.contentRepository.save(content);
    const result = plainToInstance(ContentEntity, updatedContent, {
      excludeExtraneousValues: true,
    });

    return result;
  }
  async remove(id: number) {
    const resultFind = await this.contentRepository.findOne({ where: { id } });
    if (!resultFind)
      throw new NotFoundException(`Content with ID ${id} not found`);
    await this.contentRepository.delete(id);
    return { constent: resultFind, message: 'Content deleted successfully' };
  }
}
