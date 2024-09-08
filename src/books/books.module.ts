import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookEntity } from './entities/book.entity';
import { HttpModule } from '@nestjs/axios';
import { CurrencyService } from './utilities/common/book-currency.service';
import { PaginacionModule } from 'src/pagination/pagination.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { AuthorEntity } from 'src/authors/entities/author.entity';
import { AuthorsModule } from 'src/authors/authors.module';
import { InstrumentEntity } from 'src/instruments/entities/instrument.entity';
import { ContentEntity } from 'src/contents/entities/content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookEntity,
      CategoryEntity,
      AuthorEntity,
      InstrumentEntity,
      ContentEntity,
    ]),
    HttpModule,
    PaginacionModule,
    AuthorsModule,
    CategoriesModule,
  ],
  controllers: [BooksController],
  providers: [BooksService, CurrencyService],
  exports: [BooksService],
})
export class BooksModule {}
