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
import { Between, In, Repository } from 'typeorm';
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
  deleteFileIfExists(file: string, ruta: string): void {
    const filePath = path.join(`./uploads/${ruta}/${file}`);
    if (!fs.existsSync(filePath)) return;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error al eliminar el archivo: ${filePath}`, err);
        return;
      }
    });
  }
  verifyFIle(old: string, newName: string, file: string) {
    if (old !== newName) this.deleteFileIfExists(old, file);
  }
  filesUpload(
    book: BookEntity,
    createBookDto: CreateBookDto | UpdateBookDto,
    files: Array<Express.Multer.File>,
    inventary?: string,
  ) {
    if (!Array.isArray(files)) return;
    const [imagen, file] = files;
    this.validateFilePresence(imagen, createBookDto.book_imagen, 'image');
    this.validateFilePresence(imagen, createBookDto.book_document, 'PDF');
    const documentOld = createBookDto.book_document;
    const imageOld = createBookDto.book_imagen;
    if (imagen) {
      if (imagen.mimetype === 'application/pdf') {
        const newName = `${inventary || book?.book_inventory}-${imagen.filename}`;
        this.verifyFIle(documentOld, newName, 'document');
        book.book_document = newName;
        this.rename('document', imagen.filename, newName);
      } else {
        const newName = `${inventary || book?.book_inventory}-${imagen.filename}`;
        this.verifyFIle(imageOld, newName, 'image');
        book.book_imagen = newName;
        this.rename('image', imagen.filename, newName);
      }
    }
    if (file) {
      if (file.mimetype === 'application/pdf') {
        const newName = `${inventary || book?.book_inventory}-${file.filename}`;
        this.verifyFIle(documentOld, newName, 'document');
        book.book_document = newName;
        this.rename('document', file.filename, newName);
      } else {
        const newName = `${inventary || book?.book_inventory}-${file.filename}`;
        this.verifyFIle(imageOld, newName, 'image');
        book.book_imagen = newName;
        this.rename('image', file.filename, newName);
      }
    }
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
  ensureArray = (field: any) => {
    if (!field || field === '') return [];
    if (typeof field === 'string') return [field];
    if (Array.isArray(field)) return field;
    return [];
  };

  async assingDto(book: BookEntity, createBookDto: any) {
    const { categories, authors, instruments } =
      await this.validateRefernce(createBookDto);
    book.book_title_original = createBookDto.book_title_original.toUpperCase();
    book.book_title_parallel = createBookDto.book_title_parallel?.toUpperCase();
    book.book_editorial = createBookDto.book_editorial?.toUpperCase();
    book.book_category = this.ensureArray(
      categories || createBookDto.book_category,
    );
    book.book_authors = this.ensureArray(authors || createBookDto.book_authors);
    book.book_instruments = this.ensureArray(
      instruments || createBookDto.book_instruments,
    );
    book.book_headers = this.ensureArray(createBookDto.book_headers);
    book.book_includes = this.ensureArray(createBookDto.book_includes);
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
    console.log(book);
    try {
      return await this.bookRepository.save(book);
    } catch (error) {
      throw new BadRequestException('Error en el guardado' + error);
    }
  }
  async findNews() {
    const currentDate = new Date();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const books = await this.bookRepository.find({
      where: {
        book_create_at: Between(weekAgo, currentDate),
      },
      take: 6,
    });
    return books; // O lo que desees retornar
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
        `similarity(unaccent_immutable(book.book_title_original), unaccent_immutable(:searchTerm)) > 0.3
        OR similarity(unaccent_immutable(book.book_title_parallel), unaccent_immutable(:searchTerm)) > 0.3`,
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
    searchCategories: string[] = [],
    searchAuthors: string[] = [],
    searchInstruments: string[] = [],
  ): Promise<any> {
    const query = this.bookRepository.createQueryBuilder('book');
    // Si hay un término de búsqueda, agregar la cláusula WHERE
    if (searchTerm) {
      query.andWhere(
        `(
          similarity(unaccent_immutable(book.book_title_original), unaccent_immutable(:searchTerm)) > 0.3
          OR similarity(unaccent_immutable(book.book_title_parallel), unaccent_immutable(:searchTerm)) > 0.3
          OR book.book_headers ILIKE :searchTerm
        )`,
        { searchTerm: `%${searchTerm.toLowerCase()}%` },
      );
    }
    if (searchType) {
      query.andWhere(`book.book_type = :searchType`, {
        searchType,
      });
    }
    // Buscar por categorías
    if (searchCategories?.length) {
      query
        .leftJoinAndSelect('book.book_category', 'category')
        .andWhere('category.name IN (:...searchCategories)', {
          searchCategories,
        });
    }
    // Buscar por autores
    if (searchAuthors?.length) {
      query
        .leftJoinAndSelect('book.book_authors', 'author')
        .andWhere('author.name IN (:...searchAuthors)', { searchAuthors });
    }

    // Buscar por instrumentos
    if (searchInstruments?.length) {
      query
        .leftJoinAndSelect('book.book_instruments', 'instrument')
        .andWhere('instrument.name IN (:...searchInstruments)', {
          searchInstruments,
        });
    }
    // Seleccionar los campos deseados
    query.select([
      'book.id',
      'book.book_imagen',
      'book.book_headers',
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
    query.orderBy({
      'book.book_type': 'ASC',
      'book.book_create_at': 'ASC',
    });
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

  async update(
    id: number,
    updateBookDto: UpdateBookDto,
    files: Array<Express.Multer.File>,
  ): Promise<BookEntity> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
    const { categories, authors, instruments } =
      await this.validateRefernce(updateBookDto);
    const inventary = book.book_inventory;
    Object.assign(book, updateBookDto);
    await this.assingDto(book, updateBookDto);
    this.filesUpload(book, updateBookDto, files, inventary);
    book.book_inventory = inventary;
    if (updateBookDto.book_category?.length) book.book_category = categories;
    if (updateBookDto.book_instruments?.length)
      book.book_instruments = instruments;
    if (updateBookDto.book_authors?.length) book.book_authors = authors;

    try {
      return await this.bookRepository.save(book);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating the book: ' + error.message,
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
    if (stock <= 0) {
      throw new BadRequestException('Stock must be a positive number.');
    }
    if (OrderStatus.PRESTADO === status && book.book_quantity < stock) {
      throw new BadRequestException(`Not enough stock to loan ${stock} books.`);
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
    if (stock <= 0) {
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
      this.deleteFileIfExists(book.book_document, 'document');
      this.deleteFileIfExists(book.book_imagen, 'image');
      const data = await this.bookRepository.remove(book);
      return { book: data, message: 'Book deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting the books: ' + error,
      );
    }
  }
}
