// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { LogsController } from './logs.controller';
// import { LogsService } from './logs.service';
// import { LogEntity } from './entities/log.entity'; // Importa la entidad de logs
// import { LoggingInterceptor } from './interceptor/logging.interceptor';

// @Module({
//   imports: [TypeOrmModule.forFeature([LogEntity])], // Registrar LogEntity
//   controllers: [LogsController], // Registrar el controlador
//   providers: [LogsService], // Registrar el servicio
//   exports: [LogsService, LoggingInterceptor], // Exportar el servicio para usarlo en otros módulos si es necesario
// })
// export class LogsModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { LogEntity } from './entities/log.entity'; // Ruta correcta de la entidad Log
import { LoggingInterceptor } from './interceptor/logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core'; // Necesario para interceptores globales

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity])], // Registrar LogEntity
  controllers: [LogsController], // Registrar el controlador
  providers: [
    LogsService, // Registrar el servicio
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // Usar LoggingInterceptor globalmente
    },
  ],
})
export class LogsModule {}
