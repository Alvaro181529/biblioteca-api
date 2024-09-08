import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'The category name must be a string.' })
  @IsNotEmpty({ message: 'The category name cannot be empty.' })
  category_name: string;

  @IsString({ message: 'The category description must be a string.' })
  @IsOptional()
  category_description?: string;
}
