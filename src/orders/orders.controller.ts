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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/users/utilities/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.ordersService.create(createOrderDto, currentUser);
  }

  @Get()
  async findAll(@CurrentUser() currentUser: UserEntity) {
    return await this.ordersService.findAll(currentUser);
  }

  //auth ADMIN or ROOT
  @Get('admin')
  find(
    @CurrentUser() currentUser: UserEntity,
    @Query('term') searchTerm: string,
    @Query('state') state: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ): Promise<any> {
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);
    return this.ordersService.find(
      currentUser,
      searchTerm,
      state,
      pageNumber,
      pageSizeNumber,
    );
  }
  //auth ADMIN or ROOT
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.ordersService.update(+id, updateOrderDto, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
