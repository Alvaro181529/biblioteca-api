import { Controller, Get, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
  @Get('books')
  async getBookReport(@Res() response: Response) {
    const pdfDoc = await this.reportsService.getBooksReport();
    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Reporte';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @Get('users')
  async getUserReport(@Res() response: Response) {
    const pdfDoc = await this.reportsService.getUserReport();
    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Reporte';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }
  @Get('orders')
  async getUserOrdersReport(@Res() response: Response) {
    const pdfDoc = await this.reportsService.getUserOrdersReport();
    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Reporte';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }
}
