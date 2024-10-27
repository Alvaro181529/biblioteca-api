import {
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from '../utilities/common/order-status.enum';
import { Type } from 'class-transformer';

class OrderDetailDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}
export class CreateOrderDto {
  @IsOptional()
  @IsDate()
  order_regresado_at?: Date;

  @IsOptional()
  @IsEnum(OrderStatus)
  order_status: OrderStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDetailDto)
  orders?: OrderDetailDto[];

  @IsOptional()
  userId: number;
}
