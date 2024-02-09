import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity({
  name: "files",
})
export class Files {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: "name",
    type: "varchar",
    length: 125,
    nullable: false,
  })
  name: string;

  @Column({
    name: "src",
    type: "varchar",
    length: 125,
    nullable: true,
    unique: true,
  })
  src: string;

  @ManyToOne(() => User, (user) => user.files)
  @JoinColumn({ name: "user_id" })
  user: User;
}
