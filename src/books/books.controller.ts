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
import { CurrentUser } from 'src/users/utilities/decorators/current-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) { }
  @UseGuards(
    AuthenticationGuard,
    AuthorizeGuard([Roles.ADMIN, Roles.ROOT, Roles.DOCENTE]),
  )
  @Post()
  @UseInterceptors(FilesInterceptor('files', 2, multerOptions))
  async create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<BookEntity> {
    return await this.booksService.create(createBookDto, files, currentUser);
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
  @UseGuards(
    AuthenticationGuard,
    AuthorizeGuard([Roles.DOCENTE]),
  )
  @Get('mybooks')
  async findMyBooks(
    @Query('query') query: string = '',
    @Query('type') type: string = '',
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('searchCategories') searchCategories: string = '',
    @Query('searchAuthors') searchAuthors: string = '',
    @Query('searchInstruments') searchInstruments: string = '',
    @CurrentUser() currentUser: UserEntity,
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
    return await this.booksService.findMyBooks(
      pageNumber,
      pageSizeNumber,
      query,
      type,
      searchCategoriesArray,
      searchAuthorsArray,
      searchInstrumentsArray,
      currentUser,
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
        return res
          .status(404)
          .json({ statusCode: 404, message: 'Image not found' });
      }
    });
  }
  @UseGuards(
    AuthenticationGuard)
    @Get('/files/:id')
    async findOneSound(@Param('id') id: string): Promise<BookEntity | { message: string }> {
      return await this.booksService.findOneSound(+id);
    }
    @UseGuards(
      AuthenticationGuard)
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
    @CurrentUser() currentUser: UserEntity,
  ): Promise<BookEntity> {
    return await this.booksService.update(
      +id,
      updateBookDto,
      files,
      currentUser,
    );
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
