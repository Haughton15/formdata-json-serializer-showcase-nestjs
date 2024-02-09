import { IsArray, ArrayNotEmpty, IsString } from "class-validator";

export class UploadFilesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  filesName: string[];
}
