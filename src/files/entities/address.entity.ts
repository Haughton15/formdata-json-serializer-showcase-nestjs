import { Column, Entity, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@Entity({
  name: "address",
})
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: "street",
    type: "varchar",
    length: 20,
  })
  street: string;

  @Column({
    name: "city",
    type: "varchar",
    length: 50,
  })
  city: string;

  @Column({
    name: "postal_code",
    type: "varchar",
    length: 50,
  })
  postalCode: string;

  @OneToOne(() => User, (user) => user.address)
  user: User;
}
