import { Module } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationEntity } from './entities/publication.entity';
import { PaginacionModule } from 'src/pagination/pagination.module';
import { MemcachedService } from 'src/memcached/memcached.service';

@Module({
  imports: [TypeOrmModule.forFeature([PublicationEntity]), PaginacionModule],
  controllers: [PublicationsController],
  providers: [PublicationsService, MemcachedService],
  exports: [PublicationsService],
})
export class PublicationsModule { }
