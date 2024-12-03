import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ContentsService } from './contents.service';
import { CreateContentsDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentEntity } from './entities/content.entity';
import { AuthenticationGuard } from 'src/users/utilities/guards/authentication.guards';
import { AuthorizeGuard } from 'src/users/utilities/guards/authorization.guards';
import { Roles } from 'src/users/utilities/common/user-role.enum';

@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Post()
  async create(
    @Body() createContentsDto: CreateContentsDto,
  ): Promise<ContentEntity[]> {
    return await this.contentsService.create(createContentsDto);
  }
  @Get()
  async findAll() {
    return await this.contentsService.findAll();
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.contentsService.findOne(+id);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
  ) {
    return await this.contentsService.update(+id, updateContentDto);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.contentsService.remove(+id);
  }
}
