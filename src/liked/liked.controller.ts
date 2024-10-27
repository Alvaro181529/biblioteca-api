import { Controller, Get, Body, Patch, Param, Query } from '@nestjs/common';
import { LikedService } from './liked.service';
import { UpdateRegisterDto } from 'src/registers/dto/update-register.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/users/utilities/decorators/current-user.decorator';

@Controller('liked')
export class LikedController {
  constructor(private readonly likedService: LikedService) {}

  @Get()
  findAll(
    @CurrentUser() currentUser: UserEntity,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);
    return this.likedService.findAll(currentUser, pageNumber, pageSizeNumber);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLikedDto: UpdateRegisterDto) {
    return this.likedService.update(+id, updateLikedDto);
  }
}