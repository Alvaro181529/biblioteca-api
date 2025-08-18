import { Controller, Get, UseGuards } from '@nestjs/common';
import { BackupService } from './backup.service';
import { AuthenticationGuard } from 'src/users/utilities/guards/authentication.guards';
import { AuthorizeGuard } from 'src/users/utilities/guards/authorization.guards';
import { Roles } from 'src/users/utilities/common/user-role.enum';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Get()
  async createBackup() {
    try {
      const backupPath = await this.backupService.createBackup();
      return { message: 'Backup creado exitosamente', path: backupPath };
    } catch (error) {
      return { message: 'Error al crear el backup', error: error.message };
    }
  }
}
