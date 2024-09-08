import { Module } from '@nestjs/common';
import { PaginacionService } from './pagination.service';

@Module({
  providers: [PaginacionService],
  exports: [PaginacionService], // Exporta el servicio para que otros módulos puedan usarlo
})
export class PaginacionModule {}
