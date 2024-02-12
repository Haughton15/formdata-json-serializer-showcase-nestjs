// Import necessary modules and decorators from NestJS, class-transformer, and class-validator packages
import { HttpException, HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from '../dto/create-user.dto'; // Adjust the import path as needed

// Define an asynchronous function that takes a string (expected to be JSON) and returns a promise of CreateUserDto
export async function parseAndValidate(data: string): Promise<CreateUserDto> {
  try {
    // Attempt to parse the input string as JSON
    const jsonData = JSON.parse(data);
    // Transform the parsed JSON object into an instance of CreateUserDto using class-transformer
    const createUserDto = plainToInstance(CreateUserDto, jsonData);

    // Define validation options for the class-validator
    const validationOptions = {
      skipMissingProperties: false, // Do not skip validation for any properties
      whitelist: true, // Only allow properties with decorators in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are found
      always: true, // Always apply validation rules
    };
    // Validate the DTO instance with the specified options
    const errors = await validate(createUserDto, validationOptions);
    if (errors.length > 0) {
      // If validation errors are found, map and flatten them into an array of messages
      const validationMessages = errors.flatMap((error) =>
        Object.values(error.constraints || {}).concat(
          error.children.flatMap((childError) =>
            Object.values(childError.constraints || {}),
          ),
        ),
      );
      // Throw an HttpException with the collected validation messages
      throw new HttpException(
        {
          message: validationMessages,
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    // If validation is successful, return the validated DTO instance
    return createUserDto;
  } catch (error) {
    // Catch and rethrow HttpException errors
    if (error instanceof HttpException) {
      throw error;
    }
    // For any other errors (e.g., JSON parsing errors), throw an HttpException indicating invalid JSON data
    throw new HttpException(
      {
        message: ['Invalid JSON data'],
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
