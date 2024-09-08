import { Module } from '@nestjs/common';
import { ContentsService } from './contents.service';
import { ContentsController } from './contents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentEntity } from './entities/content.entity';
import { BookEntity } from 'src/books/entities/book.entity';
import { PaginacionModule } from 'src/pagination/pagination.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContentEntity, BookEntity]),
    PaginacionModule,
  ],
  controllers: [ContentsController],
  providers: [ContentsService],
  exports: [ContentsService],
})
export class ContentsModule {}
