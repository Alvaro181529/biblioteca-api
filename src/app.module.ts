import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { CurrentUserMiddleware } from './users/utilities/middlewares/current-user.middleware';
import { BooksModule } from './books/books.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthorsModule } from './authors/authors.module';
import { PublicationsModule } from './publications/publications.module';
import { OrdersModule } from './orders/orders.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { PaginacionModule } from './pagination/pagination.module';
import { SearchController } from './search/search.controller';
import { RegistersModule } from './registers/registers.module';
import { LikedModule } from './liked/liked.module';
import { ContentsModule } from './contents/contents.module';
import { ReportsModule } from './reports/reports.module';
import { PrinterModule } from './printer/printer.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule,
    BooksModule,
    CategoriesModule,
    AuthorsModule,
    PublicationsModule,
    OrdersModule,
    InstrumentsModule,
    PaginacionModule,
    RegistersModule,
    LikedModule,
    ContentsModule,
    ReportsModule,
    PrinterModule,
  ],
  controllers: [SearchController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
