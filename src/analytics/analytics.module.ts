import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { BookEntity } from 'src/books/entities/book.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { AuthorEntity } from 'src/authors/entities/author.entity';
import { InstrumentEntity } from 'src/instruments/entities/instrument.entity';
import { ContentEntity } from 'src/contents/entities/content.entity';
import { PaginacionModule } from 'src/pagination/pagination.module';
import { AuthorsModule } from 'src/authors/authors.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from 'src/orders/entites/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookEntity,
      CategoryEntity,
      AuthorEntity,
      InstrumentEntity,
      ContentEntity,
      OrderEntity,
    ]),
    PaginacionModule,
    AuthorsModule,
    CategoriesModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
