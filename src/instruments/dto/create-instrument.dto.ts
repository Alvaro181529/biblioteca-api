import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInstrumentDto {
  @IsNotEmpty({ message: 'Instrument name is required.' })
  @IsString({ message: 'Instrument name must be a string.' })
  instrument_name: string;

  @IsNotEmpty({ message: 'Instrument family is required.' })
  @IsString({ message: 'Instrument family must be a string.' })
  instrument_family: string;
}
