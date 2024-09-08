import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthorDto {
  @IsString({ message: 'Author name must be a string.' })
  @IsNotEmpty({ message: 'Author name is required.' })
  author_name: string;

  @IsString({ message: 'Author description must be a string.' })
  @IsOptional()
  author_description?: string;
}
