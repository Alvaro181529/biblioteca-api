import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InstrumentsService } from './instruments.service';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';
import { Roles } from 'src/users/utilities/common/user-role.enum';
import { AuthorizeGuard } from 'src/users/utilities/guards/authorization.guards';
import { AuthenticationGuard } from 'src/users/utilities/guards/authentication.guards';

@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Post()
  async create(@Body() createInstrumentDto: CreateInstrumentDto) {
    return await this.instrumentsService.create(createInstrumentDto);
  }
  @UseGuards(AuthenticationGuard)
  @Get()
  async findAll(
    @Query('query') query: string = '',
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ): Promise<any> {
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);
    return this.instrumentsService.findAll(pageNumber, pageSizeNumber, query);
  }
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.instrumentsService.findOne(+id);
  }
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInstrumentDto: UpdateInstrumentDto,
  ) {
    return await this.instrumentsService.update(+id, updateInstrumentDto);
  }
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.instrumentsService.remove(+id);
  }
}
