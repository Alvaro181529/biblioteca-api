import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AuthorsService } from 'src/authors/authors.service';
import { BooksService } from 'src/books/books.service';
import { CategoriesService } from 'src/categories/categories.service';
import { ContentsService } from 'src/contents/contents.service';

@Controller('search')
export class SearchController {
  constructor(
    private readonly booksService: BooksService,
    private readonly categoriesService: CategoriesService,
    private readonly authorsService: AuthorsService,
    private readonly contentsService: ContentsService,
  ) {}

  @Get()
  async search(
    @Query('term') searchTerm: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new BadRequestException(
        'El término de búsqueda no puede estar vacío',
      );
    }
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      throw new BadRequestException('Número de página inválido');
    }

    if (isNaN(pageSizeNumber) || pageSizeNumber < 1) {
      throw new BadRequestException('Tamaño de página inválido');
    }
    try {
      const [booksResult, authorsResult, contentsResult, categoriesResult] =
        await Promise.all([
          this.booksService.searchBooks(searchTerm, pageNumber, pageSizeNumber),
          this.authorsService.searchAuthors(
            searchTerm,
            pageNumber,
            pageSizeNumber,
          ),
          this.contentsService.searchContent(
            searchTerm,
            pageNumber,
            pageSizeNumber,
          ),
          this.categoriesService.searchCategories(
            searchTerm,
            pageNumber,
            pageSizeNumber,
          ),
        ]);

      return {
        books: booksResult,
        authors: authorsResult,
        contents: contentsResult,
        categories: categoriesResult,
      };
    } catch (error) {
      throw new BadRequestException('Error en la búsqueda' + error);
    }
  }
}
