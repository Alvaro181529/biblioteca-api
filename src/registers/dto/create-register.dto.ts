import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRegisterDto {
  @IsOptional()
  @IsString()
  register_ci: string;

  @IsOptional()
  @IsNumber()
  register_contact?: number;

  @IsOptional()
  @IsString()
  register_ubication?: string;

  @IsOptional()
  @IsArray()
  register_category?: number[]; // Array of category IDs

  @IsOptional()
  @IsArray()
  register_intrument?: number[]; // Array of instrument IDs
  @IsOptional()
  @IsArray()
  register_liked?: number[]; // Array of instrument IDs

  @IsOptional()
  @IsString()
  register_professor?: string;
}
