import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LogEntity } from './entities/log.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(LogEntity)
    private readonly logRepo: Repository<LogEntity>, // Inyección del repositorio de LogEntity
  ) { }

  async logAction(params: {
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: string;
    entityId?: string;
    user: string;
    changes?: any;
  }) {
    const log = this.logRepo.create({
      ...params,
    });
    await this.logRepo.save(log); // Guardar log en la base de datos
  }

  async getAll(pageNumber: number, pageSizeNumber: number) {
    const skip = (pageNumber - 1) * pageSizeNumber;
  
    const [data, total] = await this.logRepo.findAndCount({
      order: { timestamp: 'DESC' },
      skip: skip,
      take: pageSizeNumber,
    });
  
    return {
      data,
      total,
      page: pageNumber,
      pageSize: pageSizeNumber,
      totalPages: Math.ceil(total / pageSizeNumber),
    };
  }
  
}
