import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthenticationGuard } from 'src/users/utilities/guards/authentication.guards';
import { AuthorizeGuard } from 'src/users/utilities/guards/authorization.guards';
import { Roles } from 'src/users/utilities/common/user-role.enum';
// import { CreateAnalyticsDto } from './dto/create-analytics.dto';
// import { UpdateAnalyticsDto } from './dto/update-analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('pupular')
  @UseGuards(
    AuthenticationGuard,
    AuthorizeGuard([Roles.ADMIN, Roles.ROOT, Roles.DOCENTE]),
  )
  async getPopular() {
    return this.analyticsService.getBooksPopular();
  }
  @Get('borrowed')
  @UseGuards(
    AuthenticationGuard,
    AuthorizeGuard([Roles.ADMIN, Roles.ROOT, Roles.DOCENTE]),
  )
  async getBoorrowed() {
    return this.analyticsService.getBoorrowed();
  }
  @Get('borrowed/monthly')
  @UseGuards(
    AuthenticationGuard,
    AuthorizeGuard([Roles.ADMIN, Roles.ROOT, Roles.DOCENTE]),
  )
  async getBoorrowedMontly() {
    return this.analyticsService.getMonthlyBorrowStats();
  }
  @Get('books/condition')
  @UseGuards(
    AuthenticationGuard,
    AuthorizeGuard([Roles.ADMIN, Roles.ROOT, Roles.DOCENTE]),
  )
  async getBooksCondition() {
    return this.analyticsService.getBooksConditionAndTypeCount();
  }
  @Get('books/value')
  @UseGuards(
    AuthenticationGuard,
    AuthorizeGuard([Roles.ADMIN, Roles.ROOT, Roles.DOCENTE]),
  )
  async getBooksValue() {
    return this.analyticsService.getBooksValueByType();
  }
}
