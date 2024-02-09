import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Address } from "./address.entity";
import { Files } from "./files.entity";

@Entity({
  name: "user",
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: "name",
    type: "varchar",
    length: 20,
  })
  name: string;

  @Column({
    name: "email",
    type: "varchar",
    length: 50,
  })
  email: string;

  @Column({
    name: "password",
    type: "varchar",
    length: 50,
  })
  password: string;

  @Column({
    name: "birth_date",
    type: "date",
  })
  birthDate: Date;

  @OneToOne(() => Address, (adress) => adress.user, { eager: true })
  @JoinColumn({ name: "address_id" })
  address: Address;

  @OneToMany(() => Files, (files) => files.user)
  files: Files[];
}
