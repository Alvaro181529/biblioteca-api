import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookEntity } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginacionService } from 'src/pagination/pagination.service';
import { CurrencyService } from './utilities/common/book-currency.service';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { AuthorEntity } from 'src/authors/entities/author.entity';
import { InstrumentEntity } from 'src/instruments/entities/instrument.entity';
import { ContentEntity } from 'src/contents/entities/content.entity';
import { OrderStatus } from 'src/orders/utilities/common/order-status.enum';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
    @InjectRepository(AuthorEntity)
    private readonly authorRepository: Repository<AuthorEntity>,
    @InjectRepository(InstrumentEntity)
    private readonly instrumentRepository: Repository<InstrumentEntity>,
    @InjectRepository(ContentEntity)
    private readonly contentRepository: Repository<ContentEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly currencyService: CurrencyService,
    private readonly paginacionService: PaginacionService,
  ) {}
  async validateRefernce(BookDto: any) {
    const [categories, authors, instruments] = await Promise.all([
      this.categoryRepository.findBy({ id: In(BookDto.book_category) }),
      this.authorRepository.findBy({ id: In(BookDto.book_authors) }),
      this.instrumentRepository.findBy({
        id: In(BookDto.book_instruments),
      }),
    ]);

    // Definir las validaciones en un mapa
    const validations: [any[], number, string][] = [
      [categories, BookDto.book_category.length, 'Some categories not found.'],
      [
        instruments,
        BookDto.book_instruments.length,
        'Some instruments not found.',
      ],
      [authors, BookDto.book_authors.length, 'Some authors not found.'],
    ];

    validations.forEach(([actual, expectedLength, errorMessage]) => {
      if (actual.length !== expectedLength) {
        throw new InternalServerErrorException(errorMessage);
      }
    });
    return { categories, authors, instruments };
  }
  rename(ruta: string, name: string, newName: string) {
    const oldImagePath = path.join(`./uploads/${ruta}`, name);
    const newImagePath = path.join(`./uploads/${ruta}`, newName);
    fs.renameSync(oldImagePath, newImagePath);
  }
  validateFilePresence(
    file: Express.Multer.File,
    url: string,
    fileType: string,
  ): void {
    if (!file && !url) {
      throw new NotFoundException(
        `No file uploaded and no ${fileType} URL provided`,
      );
    }
  }
  filesUpload(
    book: BookEntity,
    createBookDto: CreateBookDto,
    files: Array<Express.Multer.File>,
  ) {
    if (Array.isArray(files)) {
      const [imagen, file] = files;
      this.validateFilePresence(imagen, createBookDto.book_imagen, 'image');
      this.validateFilePresence(imagen, createBookDto.book_document, 'PDF');

      if (imagen) {
        if (imagen.mimetype === 'application/pdf') {
          const newName = `${book.book_inventory}-${imagen.filename}`;
          book.book_document = newName;
          this.rename('document', imagen.filename, newName);
        } else {
          const newName = `${book.book_inventory}-${imagen.filename}`;
          book.book_imagen = newName;
          this.rename('imagen', imagen.filename, newName);
        }
      }
      if (file) {
        if (file.mimetype === 'application/pdf') {
          const newName = `${book.book_inventory}-${file.filename}`;
          book.book_document = newName;
          this.rename('document', file.filename, newName);
        } else {
          const newName = `${book.book_inventory}-${file.filename}`;
          book.book_imagen = newName;
          this.rename('imagen', file.filename, newName);
        }
      }
    }

    return;
  }

  extractNumberFromInventory(inventory: string): number | null {
    const match = inventory.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }
  async countInventory(
    book: BookEntity,
    createBookDto: CreateBookDto | UpdateBookDto,
  ) {
    const lastBook = await this.bookRepository.findOne({
      where: { book_type: createBookDto.book_type },
      order: { id: 'DESC' },
    });
    const bookType = createBookDto.book_type.toLocaleUpperCase();
    const numberAsInteger: number = lastBook
      ? this.extractNumberFromInventory(lastBook.book_inventory) || 1
      : 0;
    const booksCount = Number(numberAsInteger);
    const formattedCount = (booksCount + 1).toString().padStart(8, '0');
    let combinedString = `${bookType}_${formattedCount}`;
    if (combinedString.length > 12) {
      const maxBookTypeLength = 12 - formattedCount.length - 1;
      combinedString = `${bookType.slice(0, maxBookTypeLength)}_${formattedCount}`;
    }
    book.book_inventory = combinedString;
  }
  async assingDto(book: BookEntity, createBookDto: any) {
    const { categories, authors, instruments } =
      await this.validateRefernce(createBookDto);
    book.book_title_original = createBookDto.book_title_original.toUpperCase();
    book.book_title_parallel = createBookDto.book_title_parallel?.toUpperCase();
    book.book_editorial = createBookDto.book_editorial?.toUpperCase();
    book.book_category = categories || [];
    book.book_authors = authors || [];
    book.book_instruments = instruments || [];
    book.book_price_type = createBookDto.book_price_type?.toUpperCase();
    book.book_price_in_bolivianos =
      book.book_price_type === 'BOB' || !book.book_price_type
        ? book.book_original_price
        : book.book_price_type
          ? await this.currencyService.convertToBolivianos(
              book.book_original_price,
              book.book_price_type,
            )
          : 0;
  }
  async create(
    createBookDto: CreateBookDto,
    files: Array<Express.Multer.File>,
  ): Promise<BookEntity> {
    const book = new BookEntity();
    Object.assign(book, createBookDto);
    await this.assingDto(book, createBookDto);
    await this.countInventory(book, createBookDto);
    this.filesUpload(book, createBookDto, files);
    try {
      return await this.bookRepository.save(book);
    } catch (error) {
      throw new BadRequestException('Error processing conversion rate' + error);
    }
  }
  async searchBooks(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    const search = searchTerm.toLowerCase();

    const [data, total] = await this.bookRepository
      .createQueryBuilder('book')
      .where(
        `similarity(unaccent(book.book_title_original), unaccent(:searchTerm)) > 0.3
        OR similarity(unaccent(book.book_title_parallel), unaccent(:searchTerm)) > 0.3`,
        {
          searchTerm: `%${search}%`,
        },
      )
      .select([
        'book.book_imagen',
        'book.book_inventory',
        'book.book_title_original',
        'book.book_title_parallel',
        'book.book_language',
        'book_condition',
        'book_location',
        'book_quantity',
        'book_observation',
      ])
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
    searchTerm: string = '',
    searchType: string = '',
  ): Promise<any> {
    // Obtén todos los libros
    const query = this.bookRepository.createQueryBuilder('book');
    // Si hay un término de búsqueda, agregar la cláusula WHERE
    if (searchTerm) {
      query.andWhere(
        `similarity(unaccent(book.book_title_original), unaccent(:searchTerm)) > 0.3
        OR similarity(unaccent(book.book_title_parallel), unaccent(:searchTerm)) > 0.3`,
        {
          searchTerm: `%${searchTerm.toLowerCase()}%`,
        },
      );
    }
    if (searchType) {
      query.andWhere(`book.book_type = :searchType`, {
        searchType,
      });
    }
    // Seleccionar los campos deseados
    query.select([
      'book.id',
      'book.book_imagen',
      'book.book_inventory',
      'book.book_type',
      'book.book_condition',
      'book.book_location',
      'book.book_title_original',
      'book.book_title_parallel',
      'book.book_language',
      'book.book_quantity',
      'book.book_observation',
    ]);

    // Obtener los resultados y el total
    const [data, total] = await query.getManyAndCount();

    // Usa el servicio de paginación para paginar los resultados
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

  async findOne(id: number): Promise<BookEntity> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: {
        book_category: true,
        book_authors: true,
        book_instruments: true,
        book_contents: true,
      },
    });
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<BookEntity> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
    const { categories, authors, instruments } =
      await this.validateRefernce(updateBookDto);
    Object.assign(book, updateBookDto);
    await this.assingDto(book, updateBookDto);
    await this.countInventory(book, updateBookDto);
    book.book_title_original = book.book_title_original.toLocaleUpperCase();
    book.book_title_parallel = book.book_title_parallel.toLocaleUpperCase();
    if (updateBookDto.book_category?.length) book.book_category = categories;
    if (updateBookDto.book_instruments?.length)
      book.book_instruments = instruments;
    if (updateBookDto.book_authors?.length) book.book_authors = authors;

    try {
      return await this.bookRepository.save(book);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating the category: ' + error.message,
      );
    }
  }

  async deactivate(id: number): Promise<BookEntity> {
    const book = await this.bookRepository.findOne({ where: { id } });

    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);

    book.book_quantity = 0;
    return await this.bookRepository.save(book);
  }
  async UpdateBook(
    id: number,
    stock: number,
    status: string,
  ): Promise<BookEntity> {
    const book = await this.findOne(id);
    this.validateUpdateBook(book, stock, id);
    if (book.book_quantity <= 0) {
      throw new NotFoundException(
        `The book with id ${book.book_title_original} is not available.`,
      );
    }
    if (OrderStatus.PRESTADO === status) {
      book.book_quantity -= stock;
      book.book_loan += stock;
    }
    if (OrderStatus.DEVUELTO === status) {
      book.book_quantity += stock;
    }
    try {
      return await this.bookRepository.save(book);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating the book.' + error,
      );
    }
  }
  private validateUpdateBook(book: any, stock: number, id: number) {
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }
    if (stock < 0) {
      throw new BadRequestException('Stock must be a non-negative number.');
    }
  }
  async remove(id: number): Promise<any> {
    const content = await this.contentRepository.find({
      where: { book: { id } },
    });
    const book = await this.bookRepository.findOne({
      where: { id },
    });
    if (content) await this.contentRepository.remove(content);
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
    try {
      const data = await this.bookRepository.remove(book);
      return { book: data, message: 'Book deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting the books: ' + error,
      );
    }
  }
}
