import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';
import { InstrumentEntity } from './entities/instrument.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginacionService } from 'src/pagination/pagination.service';
import { BookEntity } from 'src/books/entities/book.entity';

@Injectable()
export class InstrumentsService {
  constructor(
    @InjectRepository(InstrumentEntity)
    private readonly instrumentRepository: Repository<InstrumentEntity>,
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
    private readonly paginacionService: PaginacionService,
  ) {}
  async create(
    createInstrumentDto: CreateInstrumentDto,
  ): Promise<InstrumentEntity> {
    const instrument = this.instrumentRepository.create(createInstrumentDto);
    instrument.instrument_name = instrument.instrument_name.toLocaleUpperCase();
    instrument.instrument_family =
      instrument.instrument_family.toLocaleUpperCase();
    return await this.instrumentRepository.save(instrument);
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<any> {
    const [data, total] = await this.instrumentRepository.findAndCount({
      select: { id: true, instrument_name: true, instrument_family: true },
    });
    const paginatedResult = this.paginacionService.paginate(
      data,
      page,
      pageSize,
      total,
    );

    return {
      data: paginatedResult.data,
      total: paginatedResult.total,
      currentPage: paginatedResult.currentPage,
      totalPages: paginatedResult.totalPages,
      range: paginatedResult.range,
    };
  }

  async findOne(id: number) {
    const instrument = await this.instrumentRepository.findOne({
      where: { id },
      select: { instrument_name: true, instrument_family: true },
    });
    if (!instrument)
      throw new NotFoundException(`Instrument with ID ${id} not found`);
    return instrument;
  }

  async update(id: number, updateInstrumentDto: UpdateInstrumentDto) {
    const instrument = await this.instrumentRepository.findOneBy({ id });
    if (!instrument)
      throw new NotFoundException(`Instrument with ID ${id} not found.`);
    Object.assign(instrument, updateInstrumentDto);
    instrument.instrument_name = instrument.instrument_name.toLocaleUpperCase();
    instrument.instrument_family =
      instrument.instrument_family.toLocaleUpperCase();
    try {
      return await this.instrumentRepository.save(instrument);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating the instrument: ' + error.message,
      );
    }
  }

  async remove(id: number) {
    const instrument = await this.instrumentRepository.findOneBy({ id });
    if (!instrument)
      throw new NotFoundException(`Instrument with ID ${id} not found.`);
    const bookCount = await this.bookRepository.count({
      where: {
        book_category: {
          id,
        },
      },
    });
    if (bookCount > 0)
      throw new InternalServerErrorException(
        'Cannot delete category because it is associated with one or more books',
      );
    try {
      const info = await this.instrumentRepository.remove(instrument);
      return { category: info, message: 'Instrument deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting the category: ' + error.message,
      );
    }
  }
}