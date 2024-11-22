import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookEntity } from './entities/book.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './halpers/multer-options';
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}
  @Post()
  @UseInterceptors(FilesInterceptor('files', 2, multerOptions)) // Utiliza FilesInterceptor para manejar hasta 2 archivos
  async create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<BookEntity> {
    return await this.booksService.create(createBookDto, files);
  }

  @Get()
  async findAll(
    @Query('query') query: string = '',
    @Query('type') type: string = '',
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('searchCategories') searchCategories: string[] = [],
    @Query('searchAuthors') searchAuthors: string[] = [],
    @Query('searchInstruments') searchInstruments: string[] = [],
  ): Promise<any> {
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);
    return await this.booksService.findAll(
      pageNumber,
      pageSizeNumber,
      query,
      type,
      searchCategories,
      searchAuthors,
      searchInstruments,
    );
  }

  @Get('news')
  async NewsBooks() {
    return await this.booksService.findNews();
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BookEntity> {
    return await this.booksService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<BookEntity> {
    return await this.booksService.update(+id, updateBookDto);
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<{
    book: BookEntity;
    message: string;
  }> {
    const deactivate = await this.booksService.deactivate(+id);
    return {
      book: deactivate,
      message: `Book with ID ${id} has been deactivated.`,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<BookEntity> {
    return await this.booksService.remove(+id);
  }
}
