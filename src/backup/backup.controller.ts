import {
  Controller,
  Get,
  NotFoundException,
  Res,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { Response } from 'express';
import { AuthenticationGuard } from 'src/users/utilities/guards/authentication.guards';
import { AuthorizeGuard } from 'src/users/utilities/guards/authorization.guards';
import { Roles } from 'src/users/utilities/common/user-role.enum';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) { }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Get()
  async ListBackup() {
    try {
      const data = await this.backupService.ListBackupFiles();
      return data;
    } catch (error) {
      return { message: 'Error al crear el backup', error: error.message };
    }
  }
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Get('create')
  async createBackup() {
    try {
      const backupPath = await this.backupService.createBackup();
      return { message: 'Backup creado exitosamente', path: backupPath };
    } catch (error) {
      return { message: 'Error al crear el backup', error: error.message };
    }
  }
  // @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Get('download/:fileName')
  async downloadBackup(
    @Param('fileName') fileName: string,
    @Res() res: Response) {
    try {
      const fileBuffer = await this.backupService.DownloadBackupFile(fileName);
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });
      res.send(fileBuffer); // Envía el archivo al cliente
    } catch (err) {
      throw new NotFoundException('Archivo de respaldo no encontrado');
    }
  }
}
