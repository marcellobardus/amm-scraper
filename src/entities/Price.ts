import { BigNumberish } from "ethers";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Price extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @CreateDateColumn()
  public createdAt: Date;

  @Column({ type: "varchar" })
  public asset0: string;

  @Column({ type: "varchar" })
  public asset1: string;

  @Column({ type: "int" })
  public blockNumber: number;

  @Column({ type: "varchar" })
  public price: BigNumberish;
}
