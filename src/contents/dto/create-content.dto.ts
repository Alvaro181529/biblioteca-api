import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateContentDto {
  @IsString({ message: 'The section title must be a string.' })
  @IsOptional()
  content_sectionTitle: string; // Title of the section in the index
  @IsString({ message: 'The section title must be a string.' })
  @IsOptional()
  content_sectionTitleParallel: string; // Title of the section in the index

  @IsNumber({}, { message: 'The page number must be a number.' })
  @IsOptional()
  content_pageNumber?: number; // Page where the section is located

  @IsNumber({}, { message: 'The book ID must be a number.' })
  @IsNotEmpty({ message: 'The book ID is required.' })
  book: number; // ID of the book to which the content belongs
}
export class CreateContentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContentDto)
  contents: CreateContentDto[];
}
