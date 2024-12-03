import { Injectable } from '@nestjs/common';
import { PrinterService } from 'src/printer/printer.service';
import { Reports } from './documents/document.report';
import { InjectRepository } from '@nestjs/typeorm';
import { BookEntity } from 'src/books/entities/book.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrderEntity } from 'src/orders/entites/order.entity';

@Injectable()
export class ReportsService {
  constructor(
    private readonly printer: PrinterService,
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}
  async getBooksReport(): Promise<PDFKit.PDFDocument> {
    const data = await this.bookRepository.find({
      relations: { book_authors: true },
      order: {
        book_type: 'ASC',
        book_create_at: 'ASC',
      },
    });
    const columns = [
      { text: 'N', bold: true },
      { text: 'INVENTARIO', bold: true },
      { text: 'ASIGNATURA TOPOGRAFICA', bold: true },
      { text: 'TITULO ORIGINAL', bold: true },
      { text: 'AUTORES', bold: true },
      { text: 'CONDICIÓN', bold: true },
      { text: 'PRECIO ORIGINAL', bold: true },
    ];
    const widths = ['auto', 'auto', 'auto', '*', '*', 'auto', 'auto'];

    const mapFn = (book: BookEntity, index: number) => [
      { text: index + 1, margin: [0, 8] },
      { text: book.book_inventory || 'N/A', margin: [0, 8] },
      { text: book.book_location || 'N/A', margin: [0, 8] },
      { text: book.book_title_original || 'Sin Título', margin: [0, 8] },
      book.book_authors && book.book_authors.length > 0
        ? {
            ul: book.book_authors.map((author) => author.author_name),
            margin: [0, 4],
          }
        : { text: 'N/A', margin: [0, 8] },
      { text: book.book_condition, margin: [0, 8] },
      {
        text:
          book.book_price_type && book.book_original_price
            ? `(${book.book_price_type.replace(/\s+/g, '')}) ${Intl.NumberFormat(
                'en-US',
                {
                  style: 'currency',
                  currency: 'USD',
                },
              ).format(book.book_original_price)}`
            : 'Desconocida',
        bold: true,
        alignment: 'right',
        margin: [0, 5],
      },
    ];

    const docDefinition = Reports(
      'Reporte de Inventario',
      data,
      columns,
      widths,
      mapFn,
    );
    return this.printer.createPdf(docDefinition);
  }

  async getUserReport() {
    const data = await this.userRepository.find();
    const columns = [
      { text: 'N', bold: true },
      { text: 'NOMBRE', bold: true },
      { text: 'CORREO', bold: true },
      { text: 'TIPO', bold: true },
      { text: 'CI', bold: true },
      { text: 'TELEFONO', bold: true },
    ];
    const widths = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'];
    const mapFn = (user: UserEntity, index: number) => [
      { text: index + 1, margin: [0, 5] },
      { text: user.name, margin: [0, 5] },
      { text: user.email, margin: [0, 5] },
      { text: user.rols, margin: [0, 5] },
      { text: user.register.register_ci, margin: [0, 5] },
      { text: user.register.register_contact, margin: [0, 5] },
    ];
    const docDefinition = Reports(
      'Reporte Usuario',
      data,
      columns,
      widths,
      mapFn,
    );
    return this.printer.createPdf(docDefinition);
  }
  async getUserOrdersReport() {
    const data = await this.orderRepository.find({
      relations: { books: true, user: true },
      select: {
        user: { email: true, name: true },
        books: {
          book_title_original: true,
          book_imagen: true,
          book_authors: true,
          book_language: true,
          book_title_parallel: true,
        },
      },
    });
    const columns = [
      { text: 'N', bold: true },
      { text: 'NOMBRE', bold: true },
      { text: 'CORREO', bold: true },
      { text: 'ESTADO', bold: true },
      { text: 'FECHA', bold: true },
      { text: 'LIBROS', bold: true },
    ];
    const widths = ['auto', '*', 'auto', 'auto', 'auto', '*'];
    const mapFn = (order: OrderEntity, index: number) => [
      { text: index + 1, margin: [0, 5] },
      { text: order.user.name, margin: [0, 5] },
      { text: order.user.email, margin: [0, 5] },
      { text: order.order_status, margin: [0, 5] },
      {
        text: order.order_regresado_at
          ? new Date(order.order_regresado_at).toLocaleDateString('es-ES')
          : 'Sin Regresar',
        margin: [0, 5],
      },
      order.books
        ? {
            text: order.books.map((book) => book.book_title_original),
            margin: [0, 4],
          }
        : { text: 'N/A', margin: [0, 8] },
    ];
    const docDefinition = Reports(
      'Reporte Prestamos',
      data,
      columns,
      widths,
      mapFn,
    );
    return this.printer.createPdf(docDefinition);
  }
}
