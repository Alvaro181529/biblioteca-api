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
    const adjustedPage = Math.max(1, Math.min(page, totalPages));
    const start = (adjustedPage - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const paginatedData = data.slice(start, end);

    return {
      data: paginatedData,
      total,
      currentPage: adjustedPage,
      totalPages,
      range: { start: start + 1, end: end },
    };
  }
}
