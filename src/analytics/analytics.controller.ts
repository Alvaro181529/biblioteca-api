import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
// import { CreateAnalyticsDto } from './dto/create-analytics.dto';
// import { UpdateAnalyticsDto } from './dto/update-analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('pupular')
  async getPopular() {
    return this.analyticsService.getBooksPopular();
  }
  @Get('borrowed')
  async getBoorrowed() {
    return this.analyticsService.getBoorrowed();
  }
  @Get('borrowed/monthly')
  async getBoorrowedMontly() {
    return this.analyticsService.getMonthlyBorrowStats();
  }
  @Get('books/condition')
  async getBooksCondition() {
    return this.analyticsService.getBooksConditionAndTypeCount();
  }
  @Get('books/value')
  async getBooksValue() {
    return this.analyticsService.getBooksValueByType();
  }
}
