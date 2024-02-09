import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { FilesService } from "./files.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CreateUserDto } from "./dto/create-user.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { diskStorage } from "multer";
import { filenamer } from "./helper/file-namer.helper"; // External helper function
import { parseAndValidate } from "./common/parse-dataformat"; // External validation function

@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Uses external helper and validation functions for file naming and data parsing/validation.
   * Advantages:
   * - Modularity: Allows for code reusability and keeps the controller lean and focused on handling the request.
   * - Separation of Concerns: Isolates specific functionalities (like file naming and data validation) from the controller logic, improving code maintenance and readability.
   * - Ease of Testing: External functions can be independently unit tested, ensuring reliability and reducing potential bugs in the controller logic.
   */
  @Post("upload")
  @UseInterceptors(
    FilesInterceptor("file", 3, {
      storage: diskStorage({
        destination: "./static/images",
        filename: filenamer, // External function for dynamic filename handling
      }),
    }),
  )
  async upload(
    @UploadedFiles() file: Express.Multer.File[],
    @Body("data") data: string,
  ) {
    let createUserDto: CreateUserDto;
    try {
      createUserDto = await parseAndValidate(data); // External function for data parsing and validation
      // Logic to handle createUserDto after validation
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Handle other error types if necessary
      throw new BadRequestException("Error processing your request");
    }
    return this.filesService.uploadFile(file, createUserDto);
  }

  /**
   * Processes data parsing and validation within the controller using class-transformer and class-validator.
   * Advantages:
   * - Direct Control: Keeping the parsing and validation logic inside the controller gives more immediate control over data handling, potentially simplifying debugging.
   * - Simplified Workflow: For simpler scenarios or when specific controller-level manipulations are needed, this approach can reduce the need for external utilities.
   * - Cohesion: When the parsing/validation logic is tightly coupled with the controller's specific needs, having it inline can improve the cohesion of the controller's code.
   */
  @Post("up")
  @UseInterceptors(FilesInterceptor("file"))
  async uploadFile(
    @UploadedFiles() file: Express.Multer.File[],
    @Body("data") data: string,
  ) {
    let createUserDto: CreateUserDto;
    try {
      const jsonData = JSON.parse(data);
      createUserDto = plainToInstance(CreateUserDto, jsonData); // Directly parsing and instantiating DTO
      const errors = await validate(createUserDto); // Direct validation within the controller
      if (errors.length > 0) {
        const validationMessages = errors.flatMap((error) =>
          Object.values(error.constraints || {}),
        );
        throw new HttpException(
          {
            message: validationMessages,
            error: "Bad Request",
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: ["Invalid JSON data"],
          error: "Bad Request",
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.filesService.uploadFile(file, createUserDto);
  }
}
