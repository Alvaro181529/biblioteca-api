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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/users/utilities/decorators/current-user.decorator';
import { AuthenticationGuard } from 'src/users/utilities/guards/authentication.guards';
import { Roles } from 'src/users/utilities/common/user-role.enum';
import { AuthorizeGuard } from 'src/users/utilities/guards/authorization.guards';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @UseGuards(AuthenticationGuard)
  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.ordersService.create(createOrderDto, currentUser);
  }
  @UseGuards(AuthenticationGuard)
  @Get()
  async findAll(
    @Query('seach') search: string = '',
    @Query('term') searchTerm: string = '',
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @CurrentUser() currentUser: UserEntity,
  ) {
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);
    return await this.ordersService.findAll(
      pageNumber,
      pageSizeNumber,
      searchTerm,
      search,
      currentUser,
    );
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
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
  @UseGuards(AuthenticationGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.ordersService.update(+id, updateOrderDto, currentUser);
  }
  @UseGuards(AuthenticationGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
