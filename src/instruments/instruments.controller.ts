import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { InstrumentsService } from './instruments.service';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';

@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Post()
  async create(@Body() createInstrumentDto: CreateInstrumentDto) {
    return await this.instrumentsService.create(createInstrumentDto);
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ): Promise<any> {
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);
    return this.instrumentsService.findAll(pageNumber, pageSizeNumber);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.instrumentsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInstrumentDto: UpdateInstrumentDto,
  ) {
    return await this.instrumentsService.update(+id, updateInstrumentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.instrumentsService.remove(+id);
  }
}
