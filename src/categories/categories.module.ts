import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { PaginacionModule } from 'src/pagination/pagination.module';
import { BookEntity } from 'src/books/entities/book.entity';
import { MemcachedService } from 'src/memcached/memcached.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, BookEntity]),
    PaginacionModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, MemcachedService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
