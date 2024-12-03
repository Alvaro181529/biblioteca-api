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
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectRepository(PublicationEntity)
    private readonly publicationRepository: Repository<PublicationEntity>,
    private readonly paginacionService: PaginacionService,
  ) {}
  validateFilePresence(
    file: Express.Multer.File,
    url: string,
    fileType: string,
  ): void {
    if (!file && !url) {
      throw new NotFoundException(
        `No file uploaded and no ${fileType} URL provided`,
      );
    }
  }
  rename(ruta: string, name: string, newName: string) {
    const oldImagePath = path.join(`./uploads/${ruta}`, name);
    const newImagePath = path.join(`./uploads/${ruta}`, newName);
    fs.renameSync(oldImagePath, newImagePath);
  }
  deleteFileIfExists(file: string): void {
    const filePath = path.join(`./uploads/publication/${file}`);
    if (!fs.existsSync(filePath)) return;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error al eliminar el archivo: ${filePath}`, err);
        return;
      }
    });
  }

  filesUpload(
    publication: PublicationEntity,
    createPublicationDto: CreatePublicationDto | UpdatePublicationDto,
    files: Express.Multer.File,
  ) {
    if (!files) return;
    const imageOld = publication.publication_imagen || '';
    const imageFile = files;
    this.validateFilePresence(
      imageFile,
      createPublicationDto.publication_title,
      'image',
    );
    if (imageFile) {
      const title = publication.publication_title;
      const publicationTitle = title.replace(/\s+/g, '-');
      const newName = `${publicationTitle}-${imageFile.filename}`;
      if (imageOld !== newName) this.deleteFileIfExists(imageOld);
      publication.publication_imagen = newName;
      this.rename('publication', imageFile.filename, newName);
    }

    return {};
  }
  async create(
    createPublicationDto: CreatePublicationDto,
    files: Express.Multer.File,
  ) {
    const publication = new PublicationEntity();
    Object.assign(publication, createPublicationDto);
    publication.publication_title =
      createPublicationDto.publication_title.toLocaleUpperCase();
    this.filesUpload(publication, createPublicationDto, files);
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

  async update(
    id: number,
    updatePublicationDto: UpdatePublicationDto,
    files: Express.Multer.File,
  ) {
    const publication = await this.publicationRepository.findOne({
      where: { id },
    });
    if (!publication)
      throw new NotFoundException(`Publication with ID ${id} not found`);
    Object.assign(publication, updatePublicationDto);
    publication.publication_title =
      publication.publication_title.toLocaleUpperCase();
    this.filesUpload(publication, updatePublicationDto, files);
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
      this.deleteFileIfExists(publication.publication_imagen);
      const info = await this.publicationRepository.remove(publication);
      return { publication: info, message: 'Publication deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting the Publication: ' + error.message,
      );
    }
  }
}
