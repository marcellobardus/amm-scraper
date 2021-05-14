import { BaseEntity, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Trade } from "./Trade";

@Entity()
export class Account extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  public address: string;

  @OneToMany(() => Trade, (trade) => trade.account)
  public trades: Trade[];
}
