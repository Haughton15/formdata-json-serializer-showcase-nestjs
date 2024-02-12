import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsDate,
  ValidateNested,
  IsNotEmptyObject,
  MinLength,
} from 'class-validator';
import { AddressDto } from './address.dto';
import { UploadFilesDto } from './upload-files.dto';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsDate()
  @Type(() => Date)
  birthDate: Date;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => UploadFilesDto)
  files: UploadFilesDto;
}
