import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrinterModule } from 'src/printer/printer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookEntity } from 'src/books/entities/book.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrderEntity } from 'src/orders/entites/order.entity';
import { AnalyticsModule } from 'src/analytics/analytics.module';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [
    PrinterModule,
    TypeOrmModule.forFeature([BookEntity, UserEntity, OrderEntity]),
    AnalyticsModule
  ],
})
export class ReportsModule {}
