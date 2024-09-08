import { Injectable } from '@nestjs/common';

@Injectable()
export class PaginacionService {
  paginate<T>(
    data: T[],
    page: number,
    pageSize: number,
    total: number,
  ): {
    data: T[];
    total: number;
    currentPage: number;
    totalPages: number;
    range: { start: number; end: number };
  } {
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const paginatedData = data.slice(start, end);

    return {
      data: paginatedData,
      total,
      currentPage: page,
      totalPages,
      range: { start: start + 1, end: end },
    };
  }
}
