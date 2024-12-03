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
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorEntity } from './entities/author.entity';
import { Roles } from 'src/users/utilities/common/user-role.enum';
import { AuthorizeGuard } from 'src/users/utilities/guards/authorization.guards';
import { AuthenticationGuard } from 'src/users/utilities/guards/authentication.guards';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Post()
  async create(
    @Body() createAuthorDto: CreateAuthorDto,
  ): Promise<AuthorEntity> {
    return await this.authorsService.create(createAuthorDto);
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
    return this.authorsService.findAll(pageNumber, pageSizeNumber, query);
  }
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AuthorEntity> {
    return await this.authorsService.findOne(+id);
  }
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ): Promise<AuthorEntity> {
    return await this.authorsService.update(+id, updateAuthorDto);
  }
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{
    author: AuthorEntity;
    message: string;
  }> {
    return await this.authorsService.remove(+id);
  }
}
