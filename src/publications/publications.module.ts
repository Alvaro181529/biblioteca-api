import { Module } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationEntity } from './entities/publication.entity';
import { PaginacionModule } from 'src/pagination/pagination.module';

@Module({
  imports: [TypeOrmModule.forFeature([PublicationEntity]), PaginacionModule],
  controllers: [PublicationsController],
  providers: [PublicationsService],
  exports: [PublicationsService],
})
export class PublicationsModule {}
