import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorEntity } from './entities/author.entity';
import { PaginacionModule } from 'src/pagination/pagination.module';
import { BookEntity } from 'src/books/entities/book.entity';
import { MemcachedService } from 'src/memcached/memcached.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthorEntity, BookEntity]),
    PaginacionModule,
  ],
  controllers: [AuthorsController],
  providers: [AuthorsService, MemcachedService],
  exports: [AuthorsService],
})
export class AuthorsModule { }
