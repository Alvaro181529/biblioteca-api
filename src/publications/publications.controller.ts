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
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PublicationEntity } from './entities/publication.entity';
import { AuthenticationGuard } from 'src/users/utilities/guards/authentication.guards';
import { AuthorizeGuard } from 'src/users/utilities/guards/authorization.guards';
import { Roles } from 'src/users/utilities/common/user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './helpers/multer-options';
import { join } from 'path';
import { Response } from 'express';

@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async create(
    @Body() createPublicationDto: CreatePublicationDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<PublicationEntity> {
    return await this.publicationsService.create(createPublicationDto, file);
  }
  @Get()
  async findAll(
    @Query('query') query: string = '',
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ): Promise<any> {
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);
    return await this.publicationsService.findAll(
      pageNumber,
      pageSizeNumber,
      query,
    );
  }
  @Get('image/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'publication',
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
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicationsService.findOne(+id);
  }
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  update(
    @Param('id') id: string,
    @Body() updatePublicationDto: UpdatePublicationDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.publicationsService.update(+id, updatePublicationDto, file);
  }
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publicationsService.remove(+id);
  }
}
