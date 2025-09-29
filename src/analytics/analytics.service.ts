import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthorEntity } from 'src/authors/entities/author.entity';
import { BookEntity } from 'src/books/entities/book.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { ContentEntity } from 'src/contents/entities/content.entity';
import { InstrumentEntity } from 'src/instruments/entities/instrument.entity';
import { OrderEntity } from 'src/orders/entites/order.entity';
import { OrderStatus } from 'src/orders/utilities/common/order-status.enum';
import { PaginacionService } from 'src/pagination/pagination.service';
import { Not, Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(AuthorEntity)
    private readonly authorRepository: Repository<AuthorEntity>,
    @InjectRepository(InstrumentEntity)
    private readonly instrumentRepository: Repository<InstrumentEntity>,
    @InjectRepository(ContentEntity)
    private readonly contentRepository: Repository<ContentEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly paginacionService: PaginacionService,
  ) {}

  async getBooksPopular() {
    const booksCountFavorites = await this.getBooksCountPopular();

    return booksCountFavorites;
  }
  async getBoorrowed() {
    const booksBorrowed = await this.getBooksBorrowed();

    return booksBorrowed;
  }

  async getBooksCount() {
    return await this.bookRepository.count();
  }
  async getBooksCountPopular() {
    return await this.bookRepository.find({
      where: { book_loan: Not(0) },
      order: { book_loan: 'DESC' },
      select: {
        book_type: true,
        book_title_original: true,
        book_loan: true,
      },
      take: 5,
    });
  }
  async getMonthlyBorrowStats() {
    return await this.orderRepository
      .createQueryBuilder('order')
      .select("DATE_TRUNC('month', order.order_at)", 'month')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.order_status IN (:...statuses)', {
        statuses: [OrderStatus.DEVUELTO, OrderStatus.PRESTADO],
      })
      .groupBy("DATE_TRUNC('month', order.order_at)")
      .orderBy('month', 'DESC')
      .getRawMany();
  }

  async getBooksBorrowed() {
    return await this.orderRepository.find({
      where: { order_status: OrderStatus.PRESTADO },
      order: { order_create_at: 'DESC' },
      relations: {
        books: true,
      },
      select: {
        books: { book_title_original: true, book_type: true },
      },
      take: 5,
    });
  }
  async getBooksConditionAndTypeCount() {
    const countByTypeAndCondition = await this.bookRepository
      .createQueryBuilder('book')
      .select('book_type')
      .addSelect('book_condition')
      .addSelect('COUNT(*)', 'count')
      .groupBy('book_type')
      .addGroupBy('book_condition')
      .getRawMany();

    // Procesar los resultados para estructurarlos como se desea
    const result = countByTypeAndCondition.reduce((acc, row) => {
      if (!acc[row.book_type]) {
        acc[row.book_type] = [];
      }
      acc[row.book_type].push({
        book_condition: row.book_condition,
        count: parseInt(row.count, 10),
      });
      return acc;
    }, {});

    return result;
  }
  async getBooksValueByType() {
    const valueByType = await this.bookRepository
      .createQueryBuilder('book')
      .select('book_type')
      .addSelect('SUM(book_price_in_bolivianos)', 'total_value') // Sumar los valores por tipo
      .groupBy('book_type')
      .getRawMany();

    // Procesar los resultados para estructurarlos como se desea
    const result = valueByType.reduce((acc, row) => {
      acc[row.book_type] = parseFloat(row.total_value); // Asignar el valor total por tipo
      return acc;
    }, {});

    return result;
  }

  async getAuthorsCount() {
    return await this.authorRepository.count();
  }
  async getInstrumentsCount() {
    return await this.instrumentRepository.count();
  }
  async getContentsCount() {
    return await this.contentRepository.count();
  }
  async getCategoriesCount() {
    return await this.categoryRepository.count();
  }
}
