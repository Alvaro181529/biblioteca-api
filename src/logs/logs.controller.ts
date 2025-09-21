import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { AuthenticationGuard } from 'src/users/utilities/guards/authentication.guards';
import { AuthorizeGuard } from 'src/users/utilities/guards/authorization.guards';
import { Roles } from 'src/users/utilities/common/user-role.enum';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) { }

  // Endpoint para obtener todos los logs
  // @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Get()
  async getLogs(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);
    return await this.logsService.getAll(pageNumber, pageSizeNumber);
  }

  // Endpoint para crear un log
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT, Roles.COLEGIAL, Roles.DOCENTE, Roles.ESTUDENT, Roles.ESTUDIANTIL, Roles.USER]))
  @Post()
  async createLog(@Body() logData: any) {
    await this.logsService.logAction(logData);
    return { message: 'Log creado con éxito' };
  }
}
