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
  UseGuards,
  Res,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookEntity } from './entities/book.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './halpers/multer-options';
import { AuthenticationGuard } from 'src/users/utilities/guards/authentication.guards';
import { AuthorizeGuard } from 'src/users/utilities/guards/authorization.guards';
import { Roles } from 'src/users/utilities/common/user-role.enum';
import { join } from 'path';
import { Response } from 'express';
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Post()
  @UseInterceptors(FilesInterceptor('files', 2, multerOptions))
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
    @Query('searchCategories') searchCategories: string = '',
    @Query('searchAuthors') searchAuthors: string = '',
    @Query('searchInstruments') searchInstruments: string = '',
  ): Promise<any> {
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);
    const searchCategoriesArray = searchCategories
      ? searchCategories.split(',')
      : [];
    const searchAuthorsArray = searchAuthors ? searchAuthors.split(',') : [];
    const searchInstrumentsArray = searchInstruments
      ? searchInstruments.split(',')
      : [];
    return await this.booksService.findAll(
      pageNumber,
      pageSizeNumber,
      query,
      type,
      searchCategoriesArray,
      searchAuthorsArray,
      searchInstrumentsArray,
    );
  }
  @Get('image/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    // Ruta absoluta para las imágenes
    const filePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'image',
      filename,
    );
    return res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res
          .status(404)
          .json({ statusCode: 404, message: 'Image not found' });
      }
    });
  }

  @Get('document/:filename')
  async getPdf(@Param('filename') filename: string, @Res() res: Response) {
    // Ruta absoluta para los archivos PDF
    const filePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'document',
      filename,
    );
    return res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res
          .status(404)
          .json({ statusCode: 404, message: 'File not found' });
      }
    });
  }

  @UseGuards(AuthenticationGuard)
  @Get('news')
  async NewsBooks() {
    return await this.booksService.findNews();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BookEntity> {
    return await this.booksService.findOne(+id);
  }
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 2, multerOptions))
  async update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<BookEntity> {
    return await this.booksService.update(+id, updateBookDto, files);
  }
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
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
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<BookEntity> {
    return await this.booksService.remove(+id);
  }
}
