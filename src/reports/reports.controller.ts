import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';
import { AuthenticationGuard } from 'src/users/utilities/guards/authentication.guards';
import { AuthorizeGuard } from 'src/users/utilities/guards/authorization.guards';
import { Roles } from 'src/users/utilities/common/user-role.enum';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Get('books')
  async getBookReport(@Res() response: Response) {
    const pdfDoc = await this.reportsService.getBooksReport();
    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Reporte';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Get('users')
  async getUserReport(@Res() response: Response) {
    const pdfDoc = await this.reportsService.getUserReport();
    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Reporte';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Get('orders')
  async getUserOrdersReport(@Res() response: Response) {
    const pdfDoc = await this.reportsService.getUserOrdersReport();
    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Reporte';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }
}
