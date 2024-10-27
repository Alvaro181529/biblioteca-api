import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PublicationEntity } from './entities/publication.entity';
import { Repository } from 'typeorm';
import { PaginacionService } from 'src/pagination/pagination.service';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectRepository(PublicationEntity)
    private readonly publicationRepository: Repository<PublicationEntity>,
    private readonly paginacionService: PaginacionService,
  ) {}
  async create(createPublicationDto: CreatePublicationDto) {
    const publication = this.publicationRepository.create(createPublicationDto);
    publication.publication_title =
      publication.publication_title.toLocaleUpperCase();
    return await this.publicationRepository.save(publication);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    name: string = '',
  ): Promise<any> {
    const search = name.toLowerCase();
    const query = this.publicationRepository.createQueryBuilder('publications');
    if (search) {
      query.where(
        `similarity(unaccent(publications.publication_title), unaccent(:searchTerm)) > 0.3 `,
        {
          searchTerm: `%${search}%`,
        },
      );
    }
    const [data, total] = await query.getManyAndCount();
    const paginatedResult = this.paginacionService.paginate(
      data,
      page,
      pageSize,
      total,
    );

    return {
      data: paginatedResult.data,
      total: paginatedResult.total,
      currentPage: paginatedResult.currentPage,
      totalPages: paginatedResult.totalPages,
      range: paginatedResult.range,
    };
  }

  async findOne(id: number) {
    const publication = this.publicationRepository.findOne({ where: { id } });
    if (!publication)
      throw new NotFoundException(`Publication with ID ${id} not found`);
    return await publication;
  }

  async update(id: number, updatePublicationDto: UpdatePublicationDto) {
    const publication = await this.publicationRepository.findOne({
      where: { id },
    });
    if (!publication)
      throw new NotFoundException(`Publication with ID ${id} not found`);
    Object.assign(publication, updatePublicationDto);
    publication.publication_title =
      publication.publication_title.toLocaleUpperCase();
    try {
      return await this.publicationRepository.save(publication);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating the publication: ' + error.message,
      );
    }
  }

  async remove(id: number): Promise<any> {
    const publication = await this.publicationRepository.findOne({
      where: { id },
    });
    if (!publication)
      throw new NotFoundException(`Publication with ID ${id} not found`);
    try {
      const info = await this.publicationRepository.remove(publication);
      return { publication: info, message: 'Publication deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting the Publication: ' + error.message,
      );
    }
  }
}
