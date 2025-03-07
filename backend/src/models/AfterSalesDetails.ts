import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import { DataTypes } from "sequelize";
import AfterSales from "./AfterSales";

@Table
class AfterSalesDetails extends Model<AfterSalesDetails> {
  @PrimaryKey
  @Column
  id: string;

  @Column
  name: string;

  @Column
  value: string;

  @ForeignKey(() => AfterSales)
  @Column
  afterSalesId: number;

  @BelongsTo(() => AfterSales)
  afterSales: AfterSales;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column(DataTypes.VIRTUAL)
  get mediaPath(): string | null {
    if (this.name.toLocaleLowerCase().trim().startsWith("img") && this.value) {
      return `${process.env.BACKEND_URL}${
        process.env.PROXY_PORT ? `:${process.env.PROXY_PORT}` : ""
      }/public/images/aftersales/${this.afterSalesId}/${this.value}`;
    }
  }
}

export default AfterSalesDetails;