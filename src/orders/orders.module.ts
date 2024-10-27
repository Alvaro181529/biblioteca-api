import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entites/order.entity';
import { BookEntity } from 'src/books/entities/book.entity';
import { BooksModule } from 'src/books/books.module';
import { PaginacionModule } from 'src/pagination/pagination.module';
import { UserEntity } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, BookEntity, UserEntity]),
    BooksModule,
    PaginacionModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
