import { Module } from '@nestjs/common';
import { ContentsService } from './contents.service';
import { ContentsController } from './contents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentEntity } from './entities/content.entity';
import { BookEntity } from 'src/books/entities/book.entity';
import { PaginacionModule } from 'src/pagination/pagination.module';
import { MemcachedService } from 'src/memcached/memcached.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContentEntity, BookEntity]),
    PaginacionModule,
  ],
  controllers: [ContentsController],
  providers: [ContentsService, MemcachedService],
  exports: [ContentsService],
})
export class ContentsModule {}
