import { Module } from '@nestjs/common';
import { LikedService } from './liked.service';
import { LikedController } from './liked.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterEntity } from 'src/registers/entities/register.entity';
import { BookEntity } from 'src/books/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegisterEntity, BookEntity])],
  controllers: [LikedController],
  providers: [LikedService],
  exports: [LikedService],
})
export class LikedModule {}
