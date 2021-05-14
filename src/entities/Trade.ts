import { BigNumberish } from "ethers";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Account } from "./Account";
import { Price } from "./Price";

@Entity()
export class Trade extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index()
  @Column({ type: "varchar" })
  public assetIn: string;

  @Column({ type: "varchar" })
  public amountIn: BigNumberish;

  @Index()
  @Column({ type: "varchar" })
  public assetOut: string;

  @Column({ type: "varchar" })
  public amountOut: BigNumberish;

  @Column({ type: "varchar" })
  public txHash: string;

  @Column({ type: "int" })
  public blockNumber: number;

  @CreateDateColumn()
  public createdAt: Date;

  @ManyToOne(() => Account, { cascade: ["update", "insert"] })
  public account: Account;

  @ManyToOne(() => Price, { cascade: ["insert"] })
  public price: Price;
}
