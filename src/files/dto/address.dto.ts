import { IsString, IsNotEmpty, IsPostalCode } from "class-validator";

export class AddressDto {
  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsPostalCode("any")
  postalCode: string;
}
