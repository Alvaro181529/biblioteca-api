import { Module } from '@nestjs/common';
import { RegistersService } from './registers.service';
import { RegistersController } from './registers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterEntity } from './entities/register.entity';
import { InstrumentEntity } from 'src/instruments/entities/instrument.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { BookEntity } from 'src/books/entities/book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegisterEntity,
      InstrumentEntity,
      CategoryEntity,
      BookEntity,
    ]),
  ],
  controllers: [RegistersController],
  providers: [RegistersService],
  exports: [RegistersService],
})
export class RegistersModule {}
