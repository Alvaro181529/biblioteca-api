import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './entites/order.entity';
import { In, Repository } from 'typeorm';
import { BookEntity } from 'src/books/entities/book.entity';
import { OrderStatus } from './utilities/common/order-status.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { BooksService } from 'src/books/books.service';
import { PaginacionService } from 'src/pagination/pagination.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
    private readonly bookService: BooksService,
    private readonly paginacionService: PaginacionService,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: UserEntity) {
    const { order_status, order_regresado_at } = createOrderDto;
    this.validateUser(user);
    this.validateOrders(createOrderDto.orders);
    const quantities = this.getQuantities(createOrderDto.orders);

    const books = await this.getBooks(createOrderDto.orders);
    const order = new OrderEntity();
    order.books = books;
    order.order_status = order_status ?? OrderStatus.ESPERA;
    order.order_regresado_at = order_regresado_at;
    order.book_quantities = quantities;
    order.user = user;
    return await this.orderRepository.save(order);
  }

  async findAll(user: UserEntity) {
    const order = this.orderRepository.find({
      where: { user: { id: user.id } },
      relations: {
        books: true,
      },
    });
    return await order;
  }

  async find(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    const [data, total] = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.books', 'book')
      .where(
        'similarity(unaccent(user.name), unaccent(:searchTerm)) > 0.2 OR similarity(unaccent(user.email), unaccent(:searchTerm)) > 0.5',
        {
          searchTerm,
        },
      )
      .select([
        'order.id',
        'user.name',
        'user.email',
        'book.id',
        'book.book_title_original',
        'book.book_title_parallel',
        'book.book_location',
        'book.book_quantity',
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

  async update(id: number, updateOrderDto: UpdateOrderDto, user: UserEntity) {
    this.validateUser(user);
    const order = await this.orderRepository.findOne({
      where: { id: id },
      relations: { books: true },
    });
    if (
      [OrderStatus.DEVUELTO, OrderStatus.CANCELADO].includes(order.order_status)
    )
      throw new BadRequestException(`Order already ${order.order_status}`);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    const updatedOrder = await this.status(order, updateOrderDto);

    return await this.orderRepository.save(updatedOrder);
  }
  async cancel(id: number, updateOrderDto: UpdateOrderDto, user: UserEntity) {
    this.validateUser(user);
    this.validateOrders(updateOrderDto.orders);
    const order = await this.orderRepository.findOne({
      where: { id: id },
      relations: { books: true },
      select: {
        books: {
          book_title_original: true,
          book_imagen: true,
          book_authors: true,
          book_language: true,
          book_title_parallel: true,
        },
      },
    });
    return order;
  }
  remove(id: number) {
    return `This action removes a #${id} order`;
  }
  private async status(order: OrderEntity, updateOrderDto: UpdateOrderDto) {
    const { DEVUELTO, CANCELADO, ESPERA, PRESTADO } = OrderStatus;
    const { order_status: currentStatus } = order;
    const { order_status: newStatus } = updateOrderDto;
    if (currentStatus === ESPERA && newStatus !== PRESTADO) {
      throw new BadRequestException('It has to be borrowed first');
    }
    if (currentStatus === ESPERA) {
      if (newStatus === CANCELADO) {
        throw new BadRequestException('It cannot be canceled earlier');
      }
      if (newStatus === PRESTADO) {
        order.order_at = new Date();
        await this.bookUpdate(order, newStatus);
      }
    }
    if (newStatus === DEVUELTO) {
      order.order_regresado_at = new Date();
      await this.bookUpdate(order, newStatus);
    }
    order.order_status = newStatus;
    return order;
  }
  private validateUser(user: UserEntity) {
    if (!user || !user.id) {
      throw new NotFoundException('User not found');
    }

    if (
      !user.register.register_ci ||
      !user.register.register_contact ||
      !user.register.register_professor ||
      !user.register.register_ubication
    ) {
      throw new BadRequestException('User registration is incomplete');
    }
  }
  private async bookUpdate(order: OrderEntity, status: string) {
    for (const op of order.books) {
      const quantity = order.book_quantities[op.id];
      if (quantity !== undefined) {
        await this.bookService.UpdateBook(op.id, quantity, status);
      } else {
        console.error(
          `Quantity for book ID ${op.id} not found in book_quantities`,
        );
      }
    }
  }
  private validateOrders(orders: any) {
    if (!orders || orders.length === 0) {
      throw new NotFoundException(
        'At least one book with quantity is required.',
      );
    }
  }
  private async getBooks(orders: any): Promise<BookEntity[]> {
    const bookIds = orders.map((order: any) => order.id);

    const books = await this.bookRepository.findBy({
      id: In(bookIds),
    });

    const foundIds = new Set(books.map((book) => book.id));
    const notFoundIds = bookIds.filter((id: number) => !foundIds.has(id));

    if (notFoundIds.length > 0) {
      throw new NotFoundException(
        `The following book do not exist: ${notFoundIds.join(', ')}.`,
      );
    }
    return books;
  }

  private getQuantities(orders: any): { [key: number]: number } {
    return orders.reduce(
      (acc: any, { id, quantity }) => {
        acc[id] = quantity ?? 1;
        return acc;
      },
      {} as { [key: number]: number },
    );
  }
}
