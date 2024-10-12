import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Importance } from '../utilities/common/publication-level.enum';

export class CreatePublicationDto {
  @IsString({ message: 'Publication image must be a string.' })
  publication_imagen: string;

  @IsOptional()
  @IsString({ message: 'Publication title must be a string.' })
  publication_title: string;

  @IsOptional()
  @IsString({ message: 'Publication content must be a string.' })
  publication_content: string;

  @IsOptional()
  @IsEnum(Importance, {
    each: true,
    message:
      'Publication importance must be one of the following values: ALTO, MEDIO, BAJO',
  })
  publication_importance?: Importance;

  @IsOptional()
  @IsBoolean({ message: 'Publication active must be a boolean value.' })
  publication_active: boolean;
}
