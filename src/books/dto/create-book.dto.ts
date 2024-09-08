import {
  IsOptional,
  IsString,
  IsDate,
  IsInt,
  IsEnum,
  IsPositive,
  Min,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Condition } from '../utilities/common/book-dondition.enum';
import { Type } from 'class-transformer';
export class CreateBookDto {
  @IsOptional()
  @IsString({ message: 'Book image must be a string' })
  book_imagen?: string;
  @IsOptional()
  @IsString({ message: 'Book image must be a string' })
  book_document?: string;

  @IsString({ message: 'Book inventory must be a string' })
  book_inventory: string;

  @IsOptional()
  @IsString({ message: 'Book ISBN must be a string' })
  book_isbn?: string;

  @IsString({ message: 'Book title original must be a string' })
  book_title_original: string;

  @IsOptional()
  @IsString({ message: 'Book title parallel must be a string' })
  book_title_parallel?: string;

  @IsOptional()
  @IsString({ message: 'Book observation must be a string' })
  book_observation?: string;

  @IsOptional()
  @IsString({ message: 'Book location must be a string' })
  book_location?: string;

  @IsOptional()
  @IsDate({ message: 'Book acquisition date must be a valid date' })
  book_acquisition_date?: Date;

  @IsOptional()
  @IsString({ message: 'Book price type must be a string' })
  book_price_type?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Book original price must be a number' })
  @IsPositive({ message: 'Book original price must be positive' })
  @Min(0, { message: 'Book original price cannot be less than 0' })
  book_original_price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Book price in bolivianos must be a number' })
  @IsPositive({ message: 'Book price in bolivianos must be positive' })
  @Min(0, { message: 'Book price in bolivianos cannot be less than 0' })
  book_price_in_bolivianos?: number;
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(0)
  book_loan?: number;

  @IsOptional()
  @IsString({ message: 'Book language must be a string' })
  book_language?: string;

  @IsOptional()
  @IsString({ message: 'Book type must be a string' })
  book_type?: string;

  @IsOptional()
  @IsString({ message: 'Book description must be a string' })
  book_description?: string;

  @IsOptional()
  @IsEnum(Condition, {
    each: true,
    message: 'Book condition must be a valid condition',
  })
  book_condition?: Condition;

  @IsInt({ message: 'Book quantity must be an integer' })
  @IsPositive({ message: 'Book quantity must be a positive integer' })
  @Min(0, { message: 'Book quantity cannot be less than 0' })
  book_quantity: number;

  @IsOptional()
  @IsString({
    each: true,
    message: 'Book includes must be an array of strings',
  })
  book_includes?: string[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  book_category?: number[];
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  book_authors?: number[];
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  book_instruments?: number[];
}
