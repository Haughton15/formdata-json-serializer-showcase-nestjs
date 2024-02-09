import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "./dto/create-user.dto";
import { DataSource, Repository } from "typeorm";
import { Files } from "./entities/files.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Address } from "./entities/address.entity";

@Injectable()
export class FilesService {
  // Constructor injects the DataSource and Repository for Files entity
  constructor(
    private readonly datasource: DataSource,
    @InjectRepository(Files)
    private filesRepository: Repository<Files>,
  ) {}

  // Async function to handle file uploads and user creation
  async uploadFile(file: Express.Multer.File[], createUserDto: CreateUserDto) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect(); // Connects to the database
    await queryRunner.startTransaction(); // Starts a new transaction
    try {
      // Destructures and separates user and address details from the DTO
      const { name, email, password, birthDate, ...detailsUser } =
        createUserDto;
      const { city, postalCode, street } = detailsUser.address;

      // Creates a new Address record
      const address = await queryRunner.manager.create(Address, {
        city,
        postalCode,
        street,
      });
      await queryRunner.manager.save(address); // Saves the Address record to the DB

      // Creates a new User record, hashing the password before saving
      const user = await queryRunner.manager.create(User, {
        name,
        email,
        birthDate,
        password: bcrypt.hashSync(password, 10), // Hashes the password
        address: await queryRunner.manager.findOneBy(Address, {
          id: address.id,
        }),
      });
      await queryRunner.manager.save(user); // Saves the User record to the DB

      // Iterates through each file name, creating and saving Files records associated with the user
      for (let i = 0; i < detailsUser.files.filesName.length; i++) {
        const files = await queryRunner.manager.create(Files, {
          name: detailsUser.files.filesName[i],
          src: file[i].filename,
          user: await queryRunner.manager.findOneBy(User, { id: user.id }),
        });
        await queryRunner.manager.save(files); // Saves each File record to the DB
      }

      // Fetches the created User along with associated Files for the response
      const response = await queryRunner.manager.findOne(User, {
        where: { id: user.id },
        relations: ["files"],
      });
      delete response.password; // Removes password from the response for security

      await queryRunner.commitTransaction(); // Commits the transaction if all operations are successful
      await queryRunner.release(); // Releases the query runner
      return response; // Returns the user and associated files
    } catch (e) {
      // Handles errors: rolls back the transaction and releases the query runner
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.hadleDbErrors(e); // Custom function to handle and throw DB-related errors
    }
  }

  // Private helper function to interpret database errors and throw appropriate exceptions
  private hadleDbErrors(e: any) {
    if (e.code === "23505") {
      // Throws a BadRequestException if there's a unique constraint violation
      throw new BadRequestException(e.detail);
    }
    // Throws a generic InternalServerErrorException for all other errors
    throw new InternalServerErrorException("Please contact the administrator");
  }
}
