import { Module } from "@nestjs/common";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Files } from "./entities/files.entity";
import { Address } from "./entities/address.entity";
import { User } from "./entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Files, User, Address])],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
