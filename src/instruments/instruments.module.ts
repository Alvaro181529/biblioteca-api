import { Module } from '@nestjs/common';
import { InstrumentsService } from './instruments.service';
import { InstrumentsController } from './instruments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstrumentEntity } from './entities/instrument.entity';
import { PaginacionModule } from 'src/pagination/pagination.module';
import { BookEntity } from 'src/books/entities/book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InstrumentEntity, BookEntity]),
    PaginacionModule,
  ],
  controllers: [InstrumentsController],
  providers: [InstrumentsService],
  exports: [InstrumentsService],
})
export class InstrumentsModule {}
